# Recommended Development Setup
- Mac OSX, latest version
- JDK 8

## Notes
- The only script I have created is for Mac OSX. Scripts for Windows and Linux could be made, I just didn't have the time to do it.
- I'm using Java 8, Kafka 0.9.0.1, and Netty 4.0.32. The script will auto-install (and remove!) Zk/Kafka version 0.9.0.1, so if you have an existing installation, save it or don't use the script!
- No database or security has been included because this is an example.
- Use any username you like, and the password doesn't matter. Note that logging in multiple times with the same username is not allowed due to the simplistic "session" support with no true users or security present.
It would not take a lot of work to add true sessions and allow multiple logins using the same username, with updates for a user sent to all the websockets that the user currently has open.
Logging in with unique usernames on multiple browsers or tabs is not only allowed, it is coded for (users each have their own subscriptions) and encouraged.

## Prerequisites
- add zookeeper.whirlpool, kafka.whirlpool, and local.whirlpool to your local hosts file. I recommend using your assigned IP instead of localhost or 127.0.0.1. For example, mine is

192.168.1.100 zookeeper.whirlpool kafka.whirlpool local.whirlpool

## Install/Build/Start Zookeeper, Kafka, Services, and Server
- For this script, do NOT click out of your terminal window until the WhirlpoolServer tab starts. Otherwise the script will act like it worked, but will actually fail.
- Run ./maclocal_run.sh
- `NOTE`: This will `REMOVE ANY EXISTING KAFKA INSTALLATION` located at /Applications/kafka and /Applications/kafka_2.11-0.9.0.1 along with `ALL` data in /tmp/zookeeper and /tmp/kafka-logs!
- This will download (if it isn't already) version 0.9.0.1 of Kafka (with Scala 2.11) that includes Zookeeper, install them, and configure them. It will then kick off the maven build that compiles
and builds runnable deployed targets. Finally, it starts Zookeeper, then Kafka, then the services, and finally the server.

## Stop
- This script shuts down everything, but you still have to close the tabs. I haven't found a way to do that yet.
- Run ./maclocal_kill.sh
- This will kill the services and server, then shut down Kafka, then shutdown Zookeeper. `NOTE`: It will also `REMOVE` the Kafka logs and Zookeeper data in /tmp/zookeeper and /tmp/kafka-logs!!!

## Ports/Logs
- http://local.whirlpool:8080/ - the app

## Known Issues
- Logging out causes the error `WebSocket connection to 'ws://local.whirlpool:8080/wsticker' failed: Close received after close` to appear in the Chrome console. The websocket is in a
closed state, and logging in creates a new one. I don't know why the error occurs or why the websocket does not go away because it is closed on both the server and client sides.
