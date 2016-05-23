package com.khs.microservice.whirlpool.whirlpoolserver;

/*
 * Copyright 2012 The Netty Project
 *
 * The Netty Project licenses this file to you under the Apache License,
 * version 2.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpRequestDecoder;
import io.netty.handler.codec.http.HttpResponseEncoder;
import io.netty.handler.codec.string.StringDecoder;
import io.netty.handler.codec.string.StringEncoder;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;
import io.netty.util.CharsetUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Server that accept the path of a file an echo back its content.
 */
public final class WhirlpoolServer {
   private static final Logger logger = LoggerFactory.getLogger(WhirlpoolServer.class);
   private static final int PORT = Integer.parseInt(System.getProperty("port", "8080"));

   public static void main(String[] args) throws Exception {
      // Configure the server.
      EventLoopGroup bossGroup = new NioEventLoopGroup(1);
      EventLoopGroup workerGroup = new NioEventLoopGroup();
      try {
         ServerBootstrap b = new ServerBootstrap();
         b.group(bossGroup, workerGroup)
          .channel(NioServerSocketChannel.class)
          .handler(new LoggingHandler(LogLevel.INFO))
          .childHandler(new ChannelInitializer<SocketChannel>() {
             @Override
             public void initChannel(SocketChannel ch) throws Exception {
                ChannelPipeline p = ch.pipeline();
                p.addLast("encoder", new HttpResponseEncoder());
                p.addLast("decoder", new HttpRequestDecoder());
                p.addLast("stringDecoder", new StringDecoder(CharsetUtil.UTF_8));
                p.addLast("stringEncoder", new StringEncoder(CharsetUtil.UTF_8));
                p.addLast("aggregator", new HttpObjectAggregator(65536));
                p.addLast("handler", new WhirlpoolServerHandler());
             }
          });

         // Start the server.
         ChannelFuture f = b.bind(PORT).sync();
         logger.info("Whirlpool Server started");

         // Wait until the server socket is closed.
         f.channel().closeFuture().sync();
      } finally {
         logger.info("Whirlpool Server shutdown started");
         // Shut down all event loops to terminate all threads.
         bossGroup.shutdownGracefully();
         workerGroup.shutdownGracefully();
         logger.info("Whirlpool Server shutdown completed");
      }
   }
}
