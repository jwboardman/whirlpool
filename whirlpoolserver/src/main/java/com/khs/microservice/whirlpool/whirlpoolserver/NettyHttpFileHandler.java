package com.khs.microservice.whirlpool.whirlpoolserver;

import io.netty.buffer.Unpooled;
import io.netty.channel.*;
import io.netty.handler.codec.http.*;
import io.netty.handler.ssl.SslHandler;
import io.netty.handler.stream.ChunkedFile;
import io.netty.util.CharsetUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.activation.MimetypesFileTypeMap;
import java.io.*;
import java.net.URLDecoder;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.regex.Pattern;

public class NettyHttpFileHandler {
   private static final Logger logger = LoggerFactory.getLogger(NettyHttpFileHandler.class);

   private   static final Pattern INSECURE_URI = Pattern.compile(".*[<>&\"].*");
   private   static final Object  _lock = new Object();
   private   static final String  staticFileDir = "./webapp";

   protected static MimetypesFileTypeMap mimeTypesMap;

   // all methods static, no need for constructor
   public NettyHttpFileHandler() {
      synchronized(_lock) {
         if (mimeTypesMap == null) {
            InputStream is = this.getClass().getResourceAsStream("/META-INF/server.mime.types");
            if (is != null) {
               mimeTypesMap = new MimetypesFileTypeMap(is);
            } else {
               logger.error("Cannot load mime types!");
            }
         }
      }
   }
   
   public void sendFile(ChannelHandlerContext ctx, FullHttpRequest req) throws Exception {
      // handle static files
      final String uri = req.getUri();
      final String path = sanitizeUri(uri);

      if (path == null) {
         sendError(ctx, HttpResponseStatus.FORBIDDEN);
         return;
      }

      File file = new File(path);
      if ((!file.exists()) && "/index.html".equals(uri)) {
         file = new File(sanitizeUri("/index.html"));
      }

      if (!file.exists() || file.isHidden() || !file.exists() || file.isDirectory()) {
         sendError(ctx, HttpResponseStatus.NOT_FOUND);
         return;
      }

      if (!file.isFile()) {
         sendError(ctx, HttpResponseStatus.FORBIDDEN);
         return;
      }

      String contentType = mimeTypesMap.getContentType(file.getPath());
      if ("application/octet-stream".equals(contentType)) {
         file = new File(sanitizeUri("/index.html"));
      }

      // Cache Validation
      String ifModifiedSince = req.headers().get(HttpHeaders.Names.IF_MODIFIED_SINCE);
      if (ifModifiedSince != null && !ifModifiedSince.isEmpty()) {
         SimpleDateFormat dateFormatter = new SimpleDateFormat(WebSocketHelper.HTTP_DATE_FORMAT, Locale.US);
         Date ifModifiedSinceDate = dateFormatter.parse(ifModifiedSince);

         // Only compare up to the second because the datetime format we send to the client
         // does not have milliseconds
         long ifModifiedSinceDateSeconds = ifModifiedSinceDate.getTime() / 1000;
         long fileLastModifiedSeconds = file.lastModified() / 1000;
         if (ifModifiedSinceDateSeconds == fileLastModifiedSeconds) {
            sendNotModified(ctx);
            return;
         }
      }

      RandomAccessFile raf;
      try {
         raf = new RandomAccessFile(file, "r");
      } catch (FileNotFoundException ignore) {
         sendError(ctx, HttpResponseStatus.NOT_FOUND);
         return;
      }

      long fileLength = raf.length();

      HttpResponse response = new DefaultHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.OK);
      HttpHeaders.setContentLength(response, fileLength);
      setContentTypeHeader(response, file);
      WebSocketHelper.setDateAndCacheHeaders(response, file);
      if (HttpHeaders.isKeepAlive(req)) {
         response.headers().set(HttpHeaders.Names.CONNECTION, HttpHeaders.Values.KEEP_ALIVE);
      }

      // Write the initial line and the header.
      ctx.write(response);

      // Write the content.
      ChannelFuture sendFileFuture;
      ChannelFuture lastContentFuture;
      if (ctx.pipeline().get(SslHandler.class) == null) {
         sendFileFuture = ctx.write(new DefaultFileRegion(raf.getChannel(), 0, fileLength), ctx.newProgressivePromise());
         // Write the end marker.
         lastContentFuture = ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
      } else {
         sendFileFuture = ctx.write(new HttpChunkedInput(new ChunkedFile(raf, 0, fileLength, 8192)),
                         ctx.newProgressivePromise());
         // HttpChunkedInput will write the end marker (LastHttpContent) for us.
         lastContentFuture = sendFileFuture;
      }

      sendFileFuture.addListener(new ChannelProgressiveFutureListener() {
         @Override
         public void operationProgressed(ChannelProgressiveFuture future, long progress, long total) {
            if (total < 0) { // total unknown
               logger.error(future.channel() + " Transfer progress: " + progress);
            } else {
               logger.error(future.channel() + " Transfer progress: " + progress + " / " + total);
            }
         }

         @Override
         public void operationComplete(ChannelProgressiveFuture future) {
            logger.error(future.channel() + " Transfer complete.");
         }
      });

      // Decide whether to close the connection or not.
      if (!HttpHeaders.isKeepAlive(req)) {
         // Close the connection when the whole content is written out.
         lastContentFuture.addListener(ChannelFutureListener.CLOSE);
      }
   }

   public void sendRedirect(ChannelHandlerContext ctx, String newUri) {
      FullHttpResponse response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.FOUND);
      response.headers().set(HttpHeaders.Names.LOCATION, newUri);

      // Close the connection as soon as the error message is sent.
      ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
   }

   public void sendError(ChannelHandlerContext ctx, HttpResponseStatus status) {
      FullHttpResponse response = new DefaultFullHttpResponse(
            HttpVersion.HTTP_1_1, status, Unpooled.copiedBuffer("Failure: " + status + "\r\n", CharsetUtil.UTF_8));
      response.headers().set(HttpHeaders.Names.CONTENT_TYPE, "text/plain; charset=UTF-8");

      // Close the connection as soon as the error message is sent.
      ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
   }

   /**
    * When file timestamp is the same as what the browser is sending up, send a "304 Not Modified"
    *
    * @param ctx
    *            Context
    */
   public void sendNotModified(ChannelHandlerContext ctx) {
      FullHttpResponse response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.NOT_MODIFIED);
      WebSocketHelper.setDateHeader(response);

      // Close the connection as soon as the error message is sent.
      ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
   }

   /**
    * Sets the content type header for the HTTP Response
    *
    * @param response
    *            HTTP response
    * @param file
    *            file to extract content type
    */
   public void setContentTypeHeader(HttpResponse response, File file) {
      response.headers().set(HttpHeaders.Names.CONTENT_TYPE, mimeTypesMap.getContentType(file.getPath()));
   }

   public String sanitizeUri(String uri) {
      // Decode the path.
      try {
         uri = URLDecoder.decode(uri, "UTF-8");
      } catch (UnsupportedEncodingException e) {
         throw new Error(e);
      }

      if (uri.isEmpty() || uri.charAt(0) != '/') {
         return null;
      }

      // Convert file separators.
      uri = uri.replace('/', File.separatorChar);

      // Simplistic dumb security check.
      // You will have to do something serious in the production environment.
      if (uri.contains(File.separator + '.') ||
            uri.contains('.' + File.separator) ||
            uri.charAt(0) == '.' || uri.charAt(uri.length() - 1) == '.' ||
            INSECURE_URI.matcher(uri).matches()) {
         return null;
      }

      // Convert to absolute path.
      String path = staticFileDir + uri;
      logger.trace("current dir is " + Paths.get(".").toAbsolutePath().normalize().toString());
      logger.trace("path to current file is '" + path + "'");
      return path;
   }}
