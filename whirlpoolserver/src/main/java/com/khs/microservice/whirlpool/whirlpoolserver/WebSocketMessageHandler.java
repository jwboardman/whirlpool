package com.khs.microservice.whirlpool.whirlpoolserver;

import io.netty.channel.ChannelHandlerContext;

public interface WebSocketMessageHandler {
   String handleMessage(ChannelHandlerContext ctx, String frameText);
}
