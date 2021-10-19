package com.khs.microservice.whirlpool.whirlpoolserver;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.group.ChannelGroup;

public interface WebSocketMessageHandler {
   ChannelGroup getChannelGroup();
   String handleMessage(ChannelHandlerContext ctx, String frameText);
   void shutdownHandler();
}
