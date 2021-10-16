package com.khs.microservice.whirlpool.weatherservice;

import com.eclipsesource.json.Json;
import com.eclipsesource.json.JsonArray;
import com.eclipsesource.json.JsonObject;
import com.eclipsesource.json.JsonValue;
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

import java.io.IOException;
import java.net.URLEncoder;
import java.util.*;

/**
 * This producer will send stock updates to the weather topic.
 */
public class WeatherService extends BaseService {
    private static final String WEATHER_URL1_START = "https://data.api.cnn.io/weather/citySearch/json/";
    private static final String WEATHER_URL1_END = "/true";
    private static final String WEATHER_URL2_START = "https://data.api.cnn.io/weather/getForecast/";
    private static final String WEATHER_URL2_END = "/fahrenheit";

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

    private JsonObject getLocationData(String zipCode) {
        JsonObject retJO = null;
        try (CloseableHttpClient httpClient = HttpClientHelper.buildHttpClient()) {
            String url = WEATHER_URL1_START;
            url += URLEncoder.encode(zipCode, "UTF-8");
            url += WEATHER_URL1_END;

            HttpUriRequest query = RequestBuilder.get().setUri(url).build();
            try (CloseableHttpResponse queryResponse = httpClient.execute(query)) {
                HttpEntity entity = queryResponse.getEntity();
                if (entity != null) {
                    String data = EntityUtils.toString(entity);
                    JsonArray jsonArray = Json.parse(data).asArray();
                    if (!jsonArray.isNull() && !jsonArray.isEmpty()) {
                        JsonValue jsonValue = jsonArray.get(0);
                        if (!jsonValue.isNull()) {
                            retJO = jsonValue.asObject();
                        }
                    }
                }
            }
        } catch (Throwable throwable) {
            logger.error(throwable.getMessage(), throwable);
        }

        return retJO;
    }

    private JsonObject getWeatherData(String latitude, String longitude) {
        JsonObject weatherJO = null;
        try (CloseableHttpClient httpClient = HttpClientHelper.buildHttpClient()) {
            String url = WEATHER_URL2_START;
            url += URLEncoder.encode(latitude, "UTF-8");
            url += URLEncoder.encode(",", "UTF-8");
            url += URLEncoder.encode(longitude, "UTF-8");
            url += WEATHER_URL2_END;

            HttpUriRequest query = RequestBuilder.get().setUri(url).build();
            try (CloseableHttpResponse queryResponse = httpClient.execute(query)) {
                HttpEntity entity = queryResponse.getEntity();
                if (entity != null) {
                    String data = EntityUtils.toString(entity);
                    weatherJO = Json.parse(data).asObject();
                }
            }
        } catch (Throwable throwable) {
            logger.error(throwable.getMessage(), throwable);
        }

        return weatherJO;
    }

    @Override
    protected void collectData(Gson gson, String user, List<String> subscriptions) {
        Map<String, String> subscriptionData = new HashMap<>();

        for (String zipCode : subscriptions) {
            JsonObject locationJO = getLocationData(zipCode);
            if (locationJO != null) {
                String city = locationJO.get("city").asString();
                String stateOrCountry = locationJO.get("stateOrCountry").asString();
                Object latitude = locationJO.get("latitude");
                Object longitude = locationJO.get("longitude");
                JsonObject fullWeatherJO = getWeatherData(latitude.toString(), longitude.toString());
                if (fullWeatherJO != null) {
                    JsonObject currentConditionsJO = fullWeatherJO.get("currentConditions").asObject();
                    String temperature = currentConditionsJO.get("temperature").toString();
                    String feelsLikeTemperature = currentConditionsJO.get("feelsLikeTemperature").toString();
                    String conditions = currentConditionsJO.get("shortDescription").asString();
                    JsonObject weatherJO = new JsonObject();
                    weatherJO.add("temperature", temperature);
                    weatherJO.add("feelsLikeTemperature", feelsLikeTemperature);
                    weatherJO.add("conditions", conditions);
                    weatherJO.add("city", city);
                    weatherJO.add("stateOrCountry", stateOrCountry);
                    String weatherData = weatherJO.toString();
                    subscriptionData.put(zipCode, weatherData);
                } else {
                    subscriptionData.put(zipCode, "{\"result\":\"notfound\"}");
                }
            } else {
                subscriptionData.put(zipCode, "{\"result\":\"notfound\"}");
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