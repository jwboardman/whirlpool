package com.khs.microservice.whirlpool.stockservice;

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
    private static final String STOCK_URL_START = "https://finance.yahoo.com/quote/";
    private static final String STOCK_URL_END = "?p=";

    public static void main(String[] args) throws IOException {
        StockService service = new StockService();
        try {
            Thread.sleep(Long.MAX_VALUE);
        } catch (InterruptedException e) {
            logger.error(e.getMessage(), e);
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
        for (String subscription : subscriptions) {
            String url = STOCK_URL_START;
            url += subscription + STOCK_URL_END + subscription;
            try (CloseableHttpClient httpClient = HttpClientHelper.buildHttpClient()) {
                HttpUriRequest query = RequestBuilder.get().setUri(url).build();
                try (CloseableHttpResponse queryResponse = httpClient.execute(query)) {
                    HttpEntity entity = queryResponse.getEntity();
                    if (entity != null) {
                        String data = EntityUtils.toString(entity);
                        int priceOffset = data.indexOf("regularMarketPrice");
                        if (priceOffset > -1) {
                            int fmtOffset = data.indexOf("fmt", priceOffset);
                            if (fmtOffset > -1) {
                                int closeBracketOffset = data.indexOf("}", fmtOffset);
                                if (closeBracketOffset > -1) {
                                    String price = data.substring(fmtOffset + 6, closeBracketOffset - 1);
                                    subscriptionData.put(subscription, price);
                                }
                            }
                        }
                    }
                }
            } catch (Throwable throwable) {
                logger.error(throwable.getMessage(), throwable);
            }
        }

        DataResponse response = new DataResponse();
        response.setType("TickerResponse");
        response.setId(user);
        response.setResult(MessageConstants.SUCCESS);
        response.setSubscriptionData(subscriptionData);
        responseQueue.add(gson.toJson(response));
    }
}