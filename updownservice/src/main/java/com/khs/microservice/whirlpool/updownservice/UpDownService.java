package com.khs.microservice.whirlpool.updownservice;

import com.google.gson.Gson;
import com.khs.microservice.whirlpool.common.DataResponse;
import com.khs.microservice.whirlpool.common.MessageConstants;
import com.khs.microservice.whirlpool.httpclient.HttpClientHelper;
import com.khs.microservice.whirlpool.service.BaseService;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.conn.HttpHostConnectException;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.util.EntityUtils;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This producer will send stock updates to the stock-ticker topic.
 */
public class UpDownService extends BaseService {
    @SuppressWarnings("unused")
    public static void main(String[] args) throws IOException {
        UpDownService service = new UpDownService();
        try {
            Thread.sleep(Long.MAX_VALUE);
        } catch (InterruptedException e) {
            logger.error(e.getMessage(), e);
        }
    }

    public UpDownService() {
        super();
        startServer("updown-cmd", "updown");
    }

    @Override
    protected String getCommandType() {
        return "UpDownCommand";
    }

    @Override
    protected void collectData(Gson gson, String user, List<String> subscriptions) {
        Map<String, String> subscriptionData = new HashMap<>();
        for (String url : subscriptions) {
            try (CloseableHttpClient httpClient = HttpClientHelper.buildHttpClient()) {
                HttpUriRequest query = RequestBuilder.get()
                        .setUri(url)
                        .build();
                try (CloseableHttpResponse queryResponse = httpClient.execute(query)) {
                    HttpEntity entity = queryResponse.getEntity();
                    if (entity != null) {
                        String data = EntityUtils.toString(entity);
                        if (data != null && data.length() > 0) {
                            if (data.contains("www.dnsrsearch.com")) {
                                subscriptionData.put(url, "not found");
                            } else {
                                subscriptionData.put(url, "up");
                            }
                        } else {
                            subscriptionData.put(url, "down");
                        }
                    } else {
                        subscriptionData.put(url, "down");
                    }
                }
            } catch (HttpHostConnectException hhce) {
                subscriptionData.put(url, "down");
            } catch (Throwable throwable) {
                logger.error(throwable.getMessage(), throwable);
                subscriptionData.put(url, "down");
            }
        }

        DataResponse response = new DataResponse();
        response.setType("UpDownResponse");
        response.setId(user);
        response.setResult(MessageConstants.SUCCESS);
        response.setSubscriptionData(subscriptionData);
        responseQueue.add(gson.toJson(response));
    }
}