# Recommended Development Setup
- Mac OSX, latest version or Ubuntu 14.04 (I have mine running in a container inside Paralells)
- JDK 8
- Maven

## Notes
- The scripts I have created and tested for are for Mac OSX and Ubuntu (14.04 in particular). A script for Windows could be made, I just didn't have the time to do it.
- I'm using Java 8, Maven 3.3.9, Kafka 0.9.0.1, and the just released Netty 4.1.0. The script will auto-install (and remove!) Zk/Kafka version 0.9.0.1, so if you have an existing installation, save it or don't use the script!
- No database or security has been included because this is an example.
- Use any username you like, and the password doesn't matter. Note that logging in multiple times with the same username is not allowed due to the simplistic "session" support with no true users or security present.
It would not take a lot of work to add true sessions and allow multiple logins using the same username, with updates for a user sent to all the websockets that the user currently has open.
Logging in with unique usernames on multiple browsers or tabs is not only allowed, it is coded for (users each have their own subscriptions) and encouraged.

## Prerequisites
- add zookeeper.whirlpool, kafka.whirlpool, and local.whirlpool to your local hosts file. I recommend using your assigned IP instead of localhost or 127.0.0.1. For example, mine is

192.168.1.100 zookeeper.whirlpool kafka.whirlpool local.whirlpool

- Make sure you have JAVA_HOME set

## Install/Build/Start Zookeeper, Kafka, Services, and Server
- For this script, do NOT click out of your terminal window until the WhirlpoolServer tab starts. Otherwise the script will act like it worked, but will actually fail.
- Run ./maclocal_run.sh (or sudo ./linuxlocal_run.sh)
- `NOTE`: This will `REMOVE ANY EXISTING KAFKA INSTALLATION` located at /Applications/kafka and /Applications/kafka_2.11-0.9.0.1 (or /opt/kafka and /opt/kafka_2.11-0.9.0.1 for linux)
along with `ALL` data in /tmp/zookeeper and /tmp/kafka-logs!
- This will download (if it isn't already) version 0.9.0.1 of Kafka (with Scala 2.11) that includes Zookeeper, install them, and configure them, and starts them. It will then kick off the maven build that compiles
and builds runnable deployed targets. Finally, it starts the services, and finally the server.

## Stop
- This script shuts down everything and closes all except the left most tab.
- Run ./maclocal_kill.sh (or sudo ./linuxlocal_kill.sh)
- This will kill the services and server, then shut down Kafka, then shutdown Zookeeper. `NOTE`: It will also `REMOVE` the Kafka logs and Zookeeper data in /tmp/zookeeper and /tmp/kafka-logs!!!

## Ports/Logs
- http://local.whirlpool:8080/ - the app

## About the UI
Here's a screenshot:
![Whirlpool Screen Shot](https://github.com/jwboardman/whirlpool/blob/master/whirlpool.png?raw=true "Whirlpool")

- To add a stock symbol, type it in (i.e. "GOOG") and click the A button under "Stock". To remove it, click the X.
- To add a website to test whether it is up or down, type in the fully-qualified URL (i.e. http://facebook.com) and click the A button under "UpDown". To remove it, click the X.
- To add a weather check, type the city,state in (i.e. "chicago,il") and click the A button under "City,State". To remove it, click the X.

- Subscriptions survive page refresh and even login/logout (with the same userid) because they are stored with each service in memory. A "real" system
would of course use a database.

## Known Issues
- Logging out causes the error `WebSocket connection to 'ws://local.whirlpool:8080/wsticker' failed: Close received after close` to appear in the Chrome console. The websocket is in a
closed state, and logging in creates a new one. I don't know why the error occurs or why the websocket does not go away because it is closed on both the server and client sides.
