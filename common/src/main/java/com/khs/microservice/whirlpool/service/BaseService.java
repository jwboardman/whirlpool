package com.khs.microservice.whirlpool.service;

import com.google.common.io.Resources;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import com.google.gson.Gson;
import com.khs.microservice.whirlpool.common.Command;
import com.khs.microservice.whirlpool.common.CommandResponse;
import com.khs.microservice.whirlpool.common.MessageConstants;
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
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * This class contains the common code for all the services
 */
public abstract class BaseService {
    protected static final Logger logger = LoggerFactory.getLogger(BaseService.class);

    protected ExecutorService consumerExecutor;
    protected ExecutorService producerExecutor;
    protected ExecutorService dataExecutor;
    protected final Queue<String> responseQueue = new ConcurrentLinkedQueue<>();
    protected final AtomicBoolean keepRunning = new AtomicBoolean(true);

    // Keep track of the subscriptions each user has asked for info about
    protected static Map<String, List<String>> allSubscriptions = new ConcurrentHashMap<>();

    private static final ThreadFactory consumerThreadFactory = new ThreadFactoryBuilder()
        .setDaemon(true)
        .setNameFormat("consumer-%d")
        .build();
    private static final ThreadFactory producerThreadFactory = new ThreadFactoryBuilder()
        .setDaemon(true)
        .setNameFormat("producer-%d")
        .build();
    private static final ThreadFactory dataThreadFactory = new ThreadFactoryBuilder()
        .setDaemon(true)
        .setNameFormat("data-%d")
        .build();

    public BaseService() {
    }

    protected abstract String getCommandType();

    protected abstract void collectData(Gson gson, String user, List<String> subscriptions);

    public void startServer(String commandTopic, String producerTopic) {
        consumerExecutor = Executors.newSingleThreadExecutor(consumerThreadFactory);
        producerExecutor = Executors.newSingleThreadExecutor(producerThreadFactory);
        dataExecutor = Executors.newSingleThreadExecutor(dataThreadFactory);

        FutureTask<String> sendTickers = new FutureTask<>(new SendDataCallable(producerTopic));
        producerExecutor.execute(sendTickers);
        producerExecutor.shutdown();

        FutureTask<String> readTickers = new FutureTask<>(new ReaderCallable(commandTopic));
        consumerExecutor.execute(readTickers);
        consumerExecutor.shutdown();

        FutureTask<String> dataTickers = new FutureTask<>(new DataCollectorCallable());
        dataExecutor.execute(dataTickers);
        dataExecutor.shutdown();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            logger.info("Shutting down...");
            keepRunning.set(false);
        }));
    }

    /**
     * This class runs as a thread. It looks for data on the configured topic and updates the
     * appropriate subscription.
     *
     */
    public class ReaderCallable implements Callable<String> {
        // one per callable as it is stateless, but not thread safe
        private Gson gson = new Gson();
        private String topic;

        public ReaderCallable(String topic) {
            this.topic = topic;
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

            consumer.subscribe(Collections.singletonList(topic));
            int timeouts = 0;

            try {
                while (keepRunning.get()) {
                    // read records with a short timeout. If we time out, we don't really care.
                    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(500));
                    if (records.count() == 0) {
                        timeouts++;
                    } else {
                        logger.trace(String.format("Got %d records after %d timeouts\n", records.count(), timeouts));
                        timeouts = 0;
                    }

                    CommandResponse response = new CommandResponse();
                    response.setType(getCommandType());

                    for (ConsumerRecord<String, String> record : records) {
                        if (record.topic().equals(topic)) {
                            List<String> items;
                            Command command = gson.fromJson(record.value(), Command.class);
                            String commandId = command.getId();
                            response.setCommand(command.getCommand());
                            response.setSubscription(command.getSubscription());
                            response.setId(commandId);
                            response.setErrorMessage(null);

                            if (command.getCommand() != null) {
                                if ("add".equals(command.getCommand())) {
                                    items = allSubscriptions.get(commandId);
                                    if (items == null) {
                                        items = new CopyOnWriteArrayList<>();
                                    }

                                    items.add(command.getSubscription());
                                    allSubscriptions.put(commandId, items);
                                    response.setResult(MessageConstants.SUCCESS);
                                } else if ("remove".equals(command.getCommand())) {
                                    items = allSubscriptions.get(commandId);

                                    if (items.contains(command.getSubscription())) {
                                        items.remove(command.getSubscription());
                                        allSubscriptions.put(commandId, items);
                                        response.setResult(MessageConstants.SUCCESS);
                                    } else {
                                        response.setResult(MessageConstants.FAILURE);
                                        response.setCommand(command.getCommand());
                                        response.setErrorMessage("Subscription: (" + command.getSubscription() + ") was not found");
                                    }
                                } else if ("refresh".equals(command.getCommand())) {
                                    items = allSubscriptions.get(commandId);
                                    if (items != null && items.size() > 0) {
                                        collectData(gson, commandId, items);
                                    }

                                    response.setResult(MessageConstants.SUCCESS);
                                    response.setCommand(command.getCommand());
                                } else {
                                    response.setResult(MessageConstants.FAILURE);
                                    response.setErrorMessage("Command not recognized. " + record.value());
                                }
                            } else {
                                response.setResult(MessageConstants.FAILURE);
                                response.setErrorMessage("Command not recognized. " + record.value());
                            }

                            try {
                                consumer.commitSync();
                            } catch (CommitFailedException e) {
                                logger.error("commit failed", e);
                            }

                            responseQueue.add(gson.toJson(response));
                        } else {
                            try {
                                consumer.commitSync();
                            } catch (CommitFailedException e) {
                                logger.error("commit failed", e);
                            }

                            throw new IllegalStateException("Shouldn't be possible to get message on topic " + record.topic());
                        }
                    }
                }
            } finally {
                consumer.close();
            }

            return "done";
        }
    }

    /**
     * This class runs as a thread. It periodically asks the service to collect data. The service places the data
     * on the responseQueue.
     *
     */
    public class DataCollectorCallable implements Callable<String> {
        // one per callable as it is stateless, but not thread safe
        private Gson gson = new Gson();

        public DataCollectorCallable() {
        }

        @Override
        public String call() throws Exception {
            try {
                while(keepRunning.get()) {
                    if (!allSubscriptions.isEmpty()) {
                        for (String user : allSubscriptions.keySet()) {
                            List<String> subscriptions = allSubscriptions.get(user);
                            if (!subscriptions.isEmpty()) {
                                collectData(gson, user, subscriptions);
                            }
                        }
                    }

                    // only collect data every 30 seconds so remote services aren't overwhelmed with messages
                    Thread.sleep(30000L);
                }
            } catch (Throwable throwable) {
                logger.error(throwable.getMessage(), throwable);
            }

            return "done";
        }
    }

    /**
     * This class runs as a thread. It periodically checks for messages waiting to be sent and places them on
     * the configured topic.
     *
     */
    class SendDataCallable implements Callable<String> {
        private String topic;

        public SendDataCallable(String topic) {
            this.topic = topic;
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

            String message;

            try {
                while (keepRunning.get()) {
                    while ((message = responseQueue.poll()) != null) {
                        logger.debug(String.format("Sending message: '%s' to topic: '%s'", message, topic));

                        producer.send(new ProducerRecord<>(topic, message),
                            (metadata, e) -> {
                                if (e != null) {
                                    logger.error(e.getMessage(), e);
                                }

                                logger.trace(String.format("The offset of the record we just sent is: %d", metadata.offset()));
                            });
                    }

                    producer.flush();

                    // Don't busy wait
                    Thread.sleep(500L);
                }
            } catch (Throwable throwable) {
                logger.error(throwable.getMessage(), throwable);
            } finally {
                producer.close();
            }

            return "done";
        }
    }
}
