# Recommended Development Setup
- Mac OSX, latest version
- JDK 8

## Notes
- The only script I have created is for Mac OSX. Scripts for Windows and Linux could be made, I just didn't have the time to do it.
- I'm using Java 8, Kafka 0.9.0.1, and Netty 4.0.32. The script will auto-install (and remove!) Zk/Kafka version 0.9.0.1, so if you have an existing installation, save it or don't use the script!
- No database or security has been included because this is an example.
- Use any username you like, and the password doesn't matter. Note that logging in multiple times with the same username is not allowed due to the simplistic "session" support with no true users or security present.
However, logging in with unique usernames on multiple browsers or tabs is not only allowed, it is coded for (users each have their own subscriptions) and encouraged.

## Prerequisites
- add zookeeper.whirlpool, kafka.whirlpool, and whirlpool.local to your local hosts file. I recommend using your assigned IP instead of localhost or 127.0.0.1. For example, mine is
192.168.1.100 zookeeper.whirlpool kafka.whirlpool whirlpool.local

## Build/Start App
- For this script, do NOT click out of your terminal window until the WhirlpoolServer tab starts. Otherwise the script will act like it worked, but will actually fail.
- Run ./maclocal_run.sh

## Stop
- This script shuts down everything, but you still have to close the tabs. I haven't found a way to do that yet.
- Run ./maclocal_kill.sh

## Ports/Logs
- http://whirlpool.local:8080/ - the app

## Known Issues
- Logging out causes the error `WebSocket connection to 'ws://local.whirlpool:8080/wsticker' failed: Close received after close` to appear in the Chrome console. The websocket is in a
closed state, and logging in creates a new one. I don't know why the error occurs or why the websocket does not go away because it is closed on both the server and client sides.
