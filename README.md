# TL;DR
- clone repo
- `./maclocal_run.sh` or `./linuxlocal_run.sh`
- when that finishes
- `cd src/main/ui`
- `yarn start`

# Recommended Development Setup
- Mac OSX, latest version or Ubuntu 20.04 (I have mine running in a container inside Parallels)
- JDK 8
- Maven 3

## Notes
- The scripts I have created and tested for are for Mac OSX and Ubuntu (20.04 in particular). A script for Windows could be made, I just didn't have the time to do it.
- I'm using Java 8, Maven 3.8.1, Kafka 3.0.0, and Netty 5.0.0-alpha2. The script will auto-install (and remove!) Zk/Kafka version 3.0.0, so if you have an existing installation, save it or don't use the script!
- localhost is used to bypass Kafka 3.0.0's desire to look up your external hostname
- No database or security has been included because this is an example.
- Use any username you like, and the password doesn't matter. Note that logging in multiple times with the same username is not allowed due to the simplistic "session" support with no true users or security present.
It would not take a lot of work to add true sessions and allow multiple logins using the same username, with updates for a user sent to all the websockets that the user currently has open.
Logging in with unique usernames on multiple browsers or tabs is not only allowed, it is coded for (users each have their own subscriptions) and encouraged.

## Prerequisites
- MacOS make sure you have JAVA_HOME set
- Linux use set-alternatives to make Java 8 the default
- make sure your default Java is version 8. There was only so much time I had, so updating the code to a more recent Java version just wasn't going to happen

## Install/Build/Start Zookeeper, Kafka, Services, and Server
- For this script, do NOT click out of your terminal window until the WhirlpoolServer tab starts. Otherwise the script will act like it worked, but will actually fail.
- Run `./maclocal_run.sh` (or `sudo ./linuxlocal_run.sh`)
- `NOTE`: This will `REMOVE ANY EXISTING KAFKA INSTALLATION` located at /Applications/kafka and /Applications/kafka_2.13-3.0.0 (or /opt/kafka and /opt/kafka_2.13-3.0.0 for linux)
along with `ALL` data in /tmp/zookeeper and /tmp/kafka-logs!
- This will download (if it isn't already) version 3.0.0 of Kafka (with Scala 2.13) that includes Zookeeper, install them, and configure them, and starts them. It will then kick off the maven build that compiles
and builds runnable deployed targets. Finally, it starts the services, and finally the server.

## Stop
- This script shuts down everything and closes all except the left most tab.
- Run `./maclocal_kill.sh` (or `sudo ./linuxlocal_kill.sh`)
- This will kill the services and server, then shut down Kafka, then shutdown Zookeeper. `NOTE`: It will also `REMOVE` the Kafka logs and Zookeeper data in /tmp/zookeeper and /tmp/kafka-logs!!!

## About the React UI
Here's a screenshot:
![Whirlpool Screen Shot](https://github.com/jwboardman/whirlpool/blob/master/whirlpool_react_ui.png?raw=true "Whirlpool")

To get the React site running:
from the root whirlpool directory, `cd src/main/ui`
if you don't have Node installed, use nvm to easily control Node versions
  - Mac
    - install Homebrew `ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
    - install nvm `brew install nvm`
  - Linux
    - `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`
    - restart terminal

- install Node `nvm install 14.17.2`
- install yarn `npm install --global yarn`
- install node modules `yarn install`
- start dev server `yarn start`

## React UI usage
- To add a stock symbol, click anywhere on the "Stocks +" header, enter the ticker symbol (i.e. "GOOG") and click the Add button. The reason you can click on the text or the + is for accessibility - the + by itself is really too small of a target. To remove it, click the trash can icon next to the stock.
- To add a website to test whether it is up or down, click anywhere on the "Up Down +" header, type in the fully-qualified URL (i.e. http://facebook.com) and click the Add button. To remove it, click the trash can icon next to the URL.
- To add a weather check, click anywhere on the "Weather +" header, type the zip code (i.e. "10001") and click the Add button. To remove it, click the trash can icon next to the weather.

- Subscriptions survive page refresh (with the same userid) because they are stored with each service in memory. A "real" system would of course use a database. Logging out cleans up all subscriptions for a user. A cookie is set upon login so reloading the page automatically logs you back in. The cookie is expired upon logout.

## About the old Vanilla JS UI
The previous UI still works. Here's a screenshot:
![Whirlpool Screen Shot](https://github.com/jwboardman/whirlpool/blob/master/whirlpool.png?raw=true "Whirlpool")

- To add a stock symbol, type it in (i.e. "GOOG") and click the A button under "Stock". To remove it, click the X.
- To add a website to test whether it is up or down, type in the fully-qualified URL (i.e. http://facebook.com) and click the A button under "UpDown". To remove it, click the X.
- To add a weather check, type the city,state in (i.e. "chicago,il") and click the A button under "City,State". To remove it, click the X.

## Ports/Logs
- http://localhost:3000/ - the React app
- http://localhost:8080/ - the old vanilla JS UI
