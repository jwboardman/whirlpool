package com.khs.microservice.whirlpool.weatherservice;

import com.eclipsesource.json.JsonObject;
import com.eclipsesource.json.JsonValue;
import com.google.common.io.Resources;
import com.google.gson.Gson;
import com.khs.microservice.whirlpool.common.*;
import com.khs.microservice.whirlpool.httpclient.HttpClientHelper;
import com.khs.microservice.whirlpool.service.BaseService;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.util.EntityUtils;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * This producer will send stock updates to the weather topic.
 */
public class WeatherService extends BaseService {
    private static final String WEATHER_URL_START = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22";
    private static final String WEATHER_URL_END = "%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";

    public static void main(String[] args) throws IOException {
        WeatherService service = new WeatherService();
        try {
            Thread.sleep(Long.MAX_VALUE);
        } catch (InterruptedException e) {
            logger.error(e.getMessage(), e);
        }
    }

    public WeatherService() {
        super();
        startServer("weather-cmd", "weather");
    }

    @Override
    protected String getCommandType() {
        return "WeatherCommand";
    }

    @Override
    protected void collectData(Gson gson, String user, List<String> subscriptions) {
        Map<String, String> subscriptionData = new HashMap<>();

        for (String cityState : subscriptions) {
            try (CloseableHttpClient httpClient = HttpClientHelper.buildHttpClient()) {
                String url = WEATHER_URL_START;
                url += URLEncoder.encode(cityState, "UTF-8");
                url += WEATHER_URL_END;

                HttpUriRequest query = RequestBuilder.get()
                        .setUri(url)
                        .build();
                try (CloseableHttpResponse queryResponse = httpClient.execute(query)) {
                    HttpEntity entity = queryResponse.getEntity();
                    if (entity != null) {
                        String data = EntityUtils.toString(entity);
                        JsonObject jsonObject = JsonObject.readFrom(data);
                        if (jsonObject != null) {
                            JsonValue jsonValue = jsonObject.get("query");
                            if (!jsonValue.isNull()) {
                                jsonObject = jsonValue.asObject();
                                jsonValue  = jsonObject.get("results");
                                if (!jsonValue.isNull()) {
                                    jsonObject = jsonValue.asObject();
                                    jsonObject = jsonObject.get("channel").asObject();
                                    jsonObject = jsonObject.get("item").asObject();
                                    jsonObject = jsonObject.get("condition").asObject();
                                    String weatherData = jsonObject.toString();
                                    weatherData = weatherData.replaceAll("\\\\\"", "\"");
                                    subscriptionData.put(cityState, weatherData);
                                } else {
                                    subscriptionData.put(cityState, "{\"result\":\"notfound\"}");
                                }
                            }
                        } else {
                            subscriptionData.put(cityState, "{\"result\":\"notfound\"}");
                        }
                    }
                }
            } catch (Throwable throwable) {
                logger.error(throwable.getMessage(), throwable);
            }
        }

        DataResponse response = new DataResponse();
        response.setType("WeatherResponse");
        response.setId(user);
        response.setResult(MessageConstants.SUCCESS);
        response.setSubscriptionData(subscriptionData);
        responseQueue.add(gson.toJson(response));
    }
}