package com.khs.microservice.whirlpool.whirlpoolserver;

import java.util.concurrent.ConcurrentLinkedQueue;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.group.ChannelGroup;

public interface WebSocketMessageHandler {
   ChannelGroup getChannelGroup();
   ConcurrentLinkedQueue<String> getRequestQueue();
   String handleMessage(ChannelHandlerContext ctx, String frameText);
   void shutdownHandler();
}
