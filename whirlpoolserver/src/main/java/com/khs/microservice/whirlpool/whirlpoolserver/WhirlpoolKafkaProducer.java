package com.khs.microservice.whirlpool.whirlpoolserver;

import com.google.common.io.Resources;
import com.google.gson.Gson;

import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicBoolean;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import com.khs.microservice.whirlpool.common.Message;

/**
  * This class waits for command requests from the client request queue,
  * then sends them to Kafka
  *
  * @author jwb
  */
public class WhirlpoolKafkaProducer implements Callable<String> {
    private static final Logger logger = LoggerFactory.getLogger(WhirlpoolKafkaProducer.class);
    private static final AtomicBoolean keepRunning = new AtomicBoolean(true);
    private ConcurrentLinkedQueue<String> requestQueue;
    private Gson gson = new Gson();

    WhirlpoolKafkaProducer(ConcurrentLinkedQueue<String> requestQueue) {
        this.requestQueue = requestQueue;
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
