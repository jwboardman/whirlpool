package com.khs.microservice.whirlpool.httpclient;

import org.apache.http.*;
import org.apache.http.client.entity.GzipDecompressingEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

public class HttpClientHelper {
    public static CloseableHttpClient buildHttpClient() {
        CloseableHttpClient httpClient = HttpClients.custom()
                .addInterceptorFirst((HttpRequestInterceptor) (request, context) -> {
                    if (!request.containsHeader("Accept-Encoding")) {
                        request.addHeader("Accept-Encoding", "gzip");
                    }
                }).addInterceptorFirst((HttpResponseInterceptor) (response1, context) -> {
                    HttpEntity entity = response1.getEntity();
                    if (entity != null) {
                        Header ceHeader = entity.getContentEncoding();
                        if (ceHeader != null) {
                            HeaderElement[] codecs = ceHeader.getElements();
                            for (HeaderElement codec : codecs) {
                                if (codec.getName().equalsIgnoreCase("gzip")) {
                                    response1.setEntity(
                                            new GzipDecompressingEntity(response1.getEntity()));
                                    return;
                                }
                            }
                        }
                    }
                }).build();

        return httpClient;
    }
}
