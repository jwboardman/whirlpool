package com.khs.microservice.whirlpool.stockservice;

import com.eclipsesource.json.JsonArray;
import com.eclipsesource.json.JsonObject;
import com.eclipsesource.json.JsonValue;
import com.google.gson.Gson;
import com.khs.microservice.whirlpool.common.DataResponse;
import com.khs.microservice.whirlpool.common.MessageConstants;
import com.khs.microservice.whirlpool.httpclient.HttpClientHelper;
import com.khs.microservice.whirlpool.service.BaseService;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.util.EntityUtils;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This producer will send stock updates to the stock-ticker topic.
 */
public class StockService extends BaseService {
    private static final String STOCK_URL_START = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(";
    private static final String STOCK_URL_END = ")%0A%09%09&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json";

    public static void main(String[] args) throws IOException {
        StockService service = new StockService();
        try {
            Thread.sleep(Long.MAX_VALUE);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public StockService() {
        super();
        startServer("stock-ticker-cmd", "stock-ticker");
    }

    @Override
    protected String getCommandType() {
        return "TickerCommand";
    }

    @Override
    protected void collectData(Gson gson, String user, List<String> subscriptions) {
        Map<String, String> subscriptionData = new HashMap<>();
        String url = STOCK_URL_START;
        boolean first = true;
        for (String subscription : subscriptions) {
            if (first) {
                first = false;
            } else {
                url += "%2C";
            }

            url += "%22" + subscription + "%22";
        }

        url += STOCK_URL_END;

        try (CloseableHttpClient httpClient = HttpClientHelper.buildHttpClient()) {
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
                        if (jsonValue != null) {
                            jsonObject = jsonValue.asObject();
                            jsonObject = jsonObject.get("results").asObject();
                            if (jsonObject.get("quote").isArray()) {
                                JsonArray jsonArray = jsonObject.get("quote").asArray();
                                for (int i = 0; i < jsonArray.size(); i++) {
                                    jsonObject = jsonArray.get(i).asObject();
                                    String symbol = jsonObject.get("Symbol").asString();
                                    jsonValue = jsonObject.get("LastTradePriceOnly");
                                    if (!jsonValue.isNull()) {
                                        String price = jsonValue.asString();
                                        subscriptionData.put(symbol, price);
                                    } else {
                                        subscriptionData.put(symbol, "{\"result\":\"notfound\"}");
                                    }
                                }
                            } else {
                                jsonObject = jsonObject.get("quote").asObject();
                                String symbol = jsonObject.get("Symbol").asString();
                                jsonValue = jsonObject.get("LastTradePriceOnly");
                                if (!jsonValue.isNull()) {
                                    String price = jsonValue.asString();
                                    subscriptionData.put(symbol, price);
                                } else {
                                    subscriptionData.put(symbol, "{\"result\":\"notfound\"}");
                                }
                            }
                        }
                    }
                }
            }
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        DataResponse response = new DataResponse();
        response.setType("TickerResponse");
        response.setId(user);
        response.setResult(MessageConstants.SUCCESS);
        response.setSubscriptionData(subscriptionData);
        responseQueue.add(gson.toJson(response));
    }
}