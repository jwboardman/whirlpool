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
import io.netty.channel.group.DefaultChannelGroup;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.util.AttributeKey;
import io.netty.util.concurrent.GlobalEventExecutor;

import org.apache.kafka.clients.consumer.CommitFailedException;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

public class WhirlpoolMessageHandler implements WebSocketMessageHandler {
    private static final Logger logger = LoggerFactory.getLogger(WhirlpoolMessageHandler.class);
    private static final AtomicBoolean keepRunning = new AtomicBoolean(true);
    private static final ThreadFactory consumerThreadFactory = new ThreadFactoryBuilder()
        .setDaemon(true)
        .setNameFormat("to-client-%d").build();
    private static final ThreadFactory producerThreadFactory = new ThreadFactoryBuilder()
        .setDaemon(true)
        .setNameFormat("to-kafka-%d").build();

    private ConcurrentLinkedQueue<String> requestQueue = new ConcurrentLinkedQueue<>();
    private final ChannelGroup channels;

    // stateless JSON serializer/deserializer
    private Gson gson = new Gson();
    private volatile boolean shutdownHandler = false;

    public WhirlpoolMessageHandler() {
        channels = new DefaultChannelGroup("whirlpoolChannelGroup", GlobalEventExecutor.INSTANCE);
        ReadIncomingCallable toClientCallable = new ReadIncomingCallable();
        FutureTask<String> toClientPc = new FutureTask<>(toClientCallable);

        ExecutorService toClientExecutor = Executors.newSingleThreadExecutor(consumerThreadFactory);
        toClientExecutor.execute(toClientPc);
        toClientExecutor.shutdown();

        SendCommandsToKafkaCallable toKafkaCallable = new SendCommandsToKafkaCallable();
        FutureTask<String> toKafka = new FutureTask<>(toKafkaCallable);

        ExecutorService toKafkaExecutor = Executors.newSingleThreadExecutor(producerThreadFactory);
        toKafkaExecutor.execute(toKafka);
        toKafkaExecutor.shutdown();
    }

    public ChannelGroup getChannelGroup() {
        return channels;
    }

    public ConcurrentLinkedQueue<String> getRequestQueue() {
        return requestQueue;
    }

    public void shutdownHandler() {
        shutdownHandler = true;
        channels.close();
        requestQueue = null;
    }

    public String handleMessage(ChannelHandlerContext ctx, String frameText) {
        Message message = gson.fromJson(frameText, Message.class);

        // the ALL type is sent on refresh messages
        if (message.getType().equals("TickerCommand") ||
            message.getType().equals("UpDownCommand") ||
            message.getType().equals("WeatherCommand") ||
            message.getType().equals("ALL")) {
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

                while (keepRunning.get() && !shutdownHandler) {
                    while ((request = requestQueue.poll()) != null) {
                        // simple class containing only the type
                        Message message = gson.fromJson(request, Message.class);
                        List<String> topics = new ArrayList<String>();

                        switch (message.getType()) {
                            case "TickerCommand":
                                topics.add("stock-ticker-cmd");
                                break;
                            case "UpDownCommand":
                                topics.add("updown-cmd");
                                break;
                            case "WeatherCommand":
                                topics.add("weather-cmd");
                                break;
                            case "ALL":
                                topics.add("stock-ticker-cmd");
                                topics.add("updown-cmd");
                                topics.add("weather-cmd");
                                break;
                        }

                        if (topics.size() > 0) {
                            for(String topic : topics) {
                                producer.send(new ProducerRecord<>(topic, request),
                                    (metadata, e) -> {
                                        if (e != null) {
                                            logger.error(e.getMessage(), e);
                                        }

                                        logger.debug("The offset of the record we just sent is: " + metadata.offset());
                                    });

                                producer.flush();
                                Thread.sleep(20L);
                            }
                        } else {
                            logger.info(String.format("Ignoring message with unknown type %s", message.getType()));
                        }
                    }

                    Thread.sleep(500L);
                }
            } catch (Throwable throwable) {
                logger.error(throwable.getMessage(), throwable);
            } finally {
                logger.trace("Trying to close Producer");
                producer.close(Duration.ofSeconds(10L));
            }

            logger.trace("Producer thread ending");
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
                while (keepRunning.get() && !shutdownHandler) {
                    // read records with a short timeout. If we time out, we don't really care.
                    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(500));
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
                                    String key = (String)channel.attr(AttributeKey.valueOf("client")).get();
                                    if (key != null && key.equals(message.getId())) {
                                        channelFound = true;
                                        channel.writeAndFlush(new TextWebSocketFrame(record.value()));
                                        break;
                                    }
                                }

                                if (!channelFound) {
                                    // this happens when the server restarts and then tries to send data
                                    // to a client that hasn't reconnected yet
                                    // logger.warn("Can't get channel because id wasn't set!");
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
                logger.trace("Trying to close Consumer");
                consumer.close(Duration.ofSeconds(10L));
            }

            logger.trace("Consumer thread ending");
            return "done";
        }
    }
}
