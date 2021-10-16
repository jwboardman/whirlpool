package com.khs.microservice.whirlpool.whirlpoolserver;

import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.handler.codec.http.*;
import io.netty.util.AttributeKey;
import io.netty.util.CharsetUtil;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;

public class WebSocketHelper {
    public static final String  HTTP_DATE_FORMAT = "EEE, dd MMM yyyy HH:mm:ss zzz";
    public static final String  HTTP_DATE_GMT_TIMEZONE = "GMT";
    public static final int     HTTP_CACHE_SECONDS = 60;

    private static final AttributeKey<String> clientAttr = AttributeKey.valueOf("client");

    public static AttributeKey<String> getClientAttr() {
        return clientAttr;
    }

    public static void realWriteAndFlush(Channel channel, String text, String contentType, boolean keepalive, DefaultCookie nettyCookie) {
        FullHttpResponse response = new DefaultFullHttpResponse(
                HttpVersion.HTTP_1_1,
                HttpResponseStatus.OK,
                Unpooled.copiedBuffer(text + "\r\n", CharsetUtil.UTF_8));

        HttpHeaderUtil.setContentLength(response, text.length());
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, contentType);
        setDateAndCacheHeaders(response, null);
        if (keepalive) {
            response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
        }

        if (nettyCookie != null) {
            response.headers().set(HttpHeaderNames.SET_COOKIE, ServerCookieEncoder.encode(nettyCookie));
        }
        // Write the initial line and the header.
        channel.write(response);
        channel.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
    }

    /**
     * Sets the Date and Cache headers for the HTTP Response
     *
     * @param response
     *            HTTP response
     * @param fileToCache
     *            file to extract content type
     */
    public static void setDateAndCacheHeaders(HttpResponse response, File fileToCache) {
        SimpleDateFormat dateFormatter = new SimpleDateFormat(WebSocketHelper.HTTP_DATE_FORMAT, Locale.US);
        Calendar time = new GregorianCalendar();
        setDateHeader(response, time, dateFormatter);

        // Add cache headers
        time.add(Calendar.SECOND, HTTP_CACHE_SECONDS);
        response.headers().set(HttpHeaderNames.EXPIRES, dateFormatter.format(time.getTime()));
        response.headers().set(HttpHeaderNames.CACHE_CONTROL, "private, max-age=" + HTTP_CACHE_SECONDS);

        if (fileToCache != null) {
            response.headers().set(HttpHeaderNames.LAST_MODIFIED, dateFormatter.format(new Date(fileToCache.lastModified())));
        }
    }

    /**
     * Sets the Date header for the HTTP response
     *
     * @param response
     *            HTTP response
     */
    public static void setDateHeader(HttpResponse response) {
        setDateHeader(response, new GregorianCalendar());
    }

    /**
     * Sets the Date header for the HTTP response
     *
     * @param response
     *            HTTP response
     */
    public static void setDateHeader(HttpResponse response, Calendar time) {
        setDateHeader(response, time, new SimpleDateFormat(WebSocketHelper.HTTP_DATE_FORMAT, Locale.US));
    }

    /**
     * Sets the Date header for the HTTP response
     *
     * @param response
     *            HTTP response
     */
    public static void setDateHeader(HttpResponse response, Calendar time, SimpleDateFormat dateFormatter) {
        dateFormatter.setTimeZone(TimeZone.getTimeZone(WebSocketHelper.HTTP_DATE_GMT_TIMEZONE));
        response.headers().set(HttpHeaderNames.DATE, dateFormatter.format(time.getTime()));
    }

    public static DefaultCookie createCookie(String authCookieName, String domainName, String value, Long maxAge) {
        DefaultCookie nettyCookie = new DefaultCookie(authCookieName, value);
        nettyCookie.setMaxAge(maxAge);
        nettyCookie.setHttpOnly(false);
        nettyCookie.setPath("/");
        if (domainName != null && !"none".equals(domainName)) {
            nettyCookie.setDomain(domainName);
        }
        return nettyCookie;
    }

    public static DefaultCookie expireCookie(String authCookieName, String domainName) {
        return createCookie(authCookieName, domainName, "", 1L);
    }
}
