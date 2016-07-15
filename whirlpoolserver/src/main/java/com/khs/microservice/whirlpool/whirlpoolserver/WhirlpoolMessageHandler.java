package com.khs.microservice.whirlpool.whirlpoolserver;

import com.google.common.io.Resources;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import com.google.gson.Gson;
import com.khs.microservice.whirlpool.common.CommandResponse;
import com.khs.microservice.whirlpool.common.Message;
import com.khs.microservice.whirlpool.common.MessageConstants;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.group.ChannelGroup;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import org.apache.kafka.clients.consumer.CommitFailedException;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.util.Arrays;
import java.util.Properties;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

public class WhirlpoolMessageHandler implements WebSocketMessageHandler {
    private static final Logger logger = LoggerFactory.getLogger(WhirlpoolMessageHandler.class);

    // stateless JSON serializer/deserializer
    private Gson gson = new Gson();

    private static final AtomicBoolean keepRunning = new AtomicBoolean(true);

    private final ConcurrentLinkedQueue<String> requestQueue = new ConcurrentLinkedQueue<>();

    private final ChannelGroup channels;

    public WhirlpoolMessageHandler(ChannelGroup channels) {
        this.channels = channels;
        ReadIncomingCallable toClientCallable = new ReadIncomingCallable();
        FutureTask<String> toClientPc = new FutureTask<>(toClientCallable);

        ExecutorService toClientExecutor = Executors.newSingleThreadExecutor(
                new ThreadFactoryBuilder()
                        .setDaemon(true)
                        .setNameFormat("to-client-%d")
                        .build()
        );
        toClientExecutor.execute(toClientPc);

        SendCommandsToKafkaCallable toKafkaCallable = new SendCommandsToKafkaCallable();
        FutureTask<String> toKafka = new FutureTask<>(toKafkaCallable);

        ExecutorService toKafkaExecutor = Executors.newSingleThreadExecutor(
                new ThreadFactoryBuilder()
                        .setDaemon(true)
                        .setNameFormat("to-kafka-%d")
                        .build()
        );
        toKafkaExecutor.execute(toKafka);
    }

    public String handleMessage(ChannelHandlerContext ctx, String frameText) {
        Message message = gson.fromJson(frameText, Message.class);

        if (message.getType().equals("TickerCommand") ||
            message.getType().equals("UpDownCommand") ||
            message.getType().equals("WeatherCommand")) {
            requestQueue.add(frameText);
        } else {
            CommandResponse commandResponse = new CommandResponse();
            commandResponse.setCommand("");
            commandResponse.setResult(MessageConstants.FAILURE);
            commandResponse.setErrorMessage("Message not recognized.");
            return gson.toJson(commandResponse, CommandResponse.class);
        }

        return null;
    }

    /**
     * This class waits for command requests from the client request queue,
     * then sends them to Kafka
     *
     * @author jwb
     */
    private class SendCommandsToKafkaCallable implements Callable<String> {
        SendCommandsToKafkaCallable() {
        }

        @Override
        public String call() throws Exception {
            // set up the producer
            KafkaProducer<String, String> producer;
            try (InputStream props = Resources.getResource("producer.props").openStream()) {
                Properties properties = new Properties();
                properties.load(props);
                producer = new KafkaProducer<>(properties);
            }

            try {
                String request;

                while (keepRunning.get()) {
                    while ((request = requestQueue.poll()) != null) {
                        // simple class containing only the type
                        Message message = gson.fromJson(request, Message.class);
                        String topic = null;

                        switch (message.getType()) {
                            case "TickerCommand":
                                topic = "stock-ticker-cmd";
                                break;
                            case "UpDownCommand":
                                topic = "updown-cmd";
                                break;
                            case "WeatherCommand":
                                topic = "weather-cmd";
                                break;
                        }

                        if (topic != null) {
                            producer.send(new ProducerRecord<>(topic, request),
                                    (metadata, e) -> {
                                        if (e != null) {
                                            logger.error(e.getMessage(), e);
                                        }

                                        logger.debug("The offset of the record we just sent is: " + metadata.offset());
                                    });
                        } else {
                            logger.info(String.format("Ignoring message with unknown type %s", message.getType()));
                        }
                    }

                    producer.flush();
                    Thread.sleep(20L);
                }
            } catch (Throwable throwable) {
                logger.error(throwable.getMessage(), throwable);
            } finally {
                producer.close();
            }

            return "done";
        }
    }

    private class ReadIncomingCallable implements Callable<String> {
        ReadIncomingCallable() {
        }

        @Override
        public String call() throws Exception {
            // and the consumer
            KafkaConsumer<String, String> consumer;
            try (InputStream props = Resources.getResource("consumer.props").openStream()) {
                Properties properties = new Properties();
                properties.load(props);
                consumer = new KafkaConsumer<>(properties);
            }

            consumer.subscribe(Arrays.asList("stock-ticker", "weather", "updown"));
            int timeouts = 0;

            try {
                while (keepRunning.get()) {
                    // read records with a short timeout. If we time out, we don't really care.
                    ConsumerRecords<String, String> records = consumer.poll(200);
                    if (records.count() == 0) {
                        timeouts++;
                    } else {
                        logger.trace(String.format("Got %d records after %d timeouts\n", records.count(), timeouts));
                        timeouts = 0;
                    }

                    for (ConsumerRecord<String, String> record : records) {
                        logger.trace(String.format("Record for topic %s on partition %d offset %d is: %s\n", record.topic(), record.partition(), record.offset(), record.value()));
                        switch (record.topic()) {
                            case "stock-ticker":
                            case "weather":
                            case "updown":
                                try {
                                    consumer.commitSync();
                                } catch (CommitFailedException e) {
                                    logger.error("commit failed", e);
                                }

                                boolean channelFound = false;
                                Message message = gson.fromJson(record.value(), Message.class);
                                for (Channel channel : channels) {
                                    String key = channel.attr(WebSocketHelper.getClientAttr()).get();
                                    if (key.equals(message.getId())) {
                                        channelFound = true;
                                        channel.writeAndFlush(new TextWebSocketFrame(record.value()));
                                        break;
                                    }
                                }

                                if (!channelFound) {
                                    logger.warn("Can't get channel because id wasn't set!");
                                }
                                break;

                            default:
                                try {
                                    consumer.commitSync();
                                } catch (CommitFailedException e) {
                                    logger.error("commit failed", e);
                                }

                                throw new IllegalStateException("Shouldn't be possible to get message on topic " + record.topic());
                        }
                    }
                }
            } catch(Throwable t) {
                logger.error(t.getMessage(), t);
            } finally {
                consumer.close();
            }

            return "done";
        }
    }
}
