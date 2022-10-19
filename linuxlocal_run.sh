#!/bin/bash

zookeeper_init() {
    # If the configuration file exists then we are already setup
    if [ -e "${ZOOKEEPER_HOME}/config/zoo.cfg" ]; then
        return
    fi

    echo "Initializing Apache Zookeeper Server..."

    # Create the config files
    cat >"${ZOOKEEPER_HOME}/config/zoo.cfg" <<EOF
clientPortAddress=localhost
tickTime=2000
initLimit=10
syncLimit=5
admin.enableServer=false
clientPort=2181
maxClientCnxns=60
autopurge.snapRetainCount=3
autopurge.purgeInterval=1
dataDir=/tmp/zookeeper
EOF

    cat >"${ZOOKEEPER_HOME}/config/java.env" <<EOF
export JVMFLAGS="-Xmx64m -Xms64m"
EOF
}

function kafka_init() {
    # Get the current broker ID. If the ID is zero then this server is not setup.
    local BID=$(cat ${KAFKA_HOME}/config/server.properties  |grep broker.id |sed 's/broker.id\s*=\s*\([0-9]*\)/\1/')
    if [ "${BID}" != "0" ]; then
        return
    fi

    echo "Initializing Apache Kafka Server..."

#    local HSTN=$(cat /data/hostname 2>/dev/null)
    local HSTN=localhost
    [ -z "${HSTN}" ] && [ ! -z "${ZOOKEEPER}" ] && HSTN="kafka.whirlpool"
    [ -z "${HSTN}" ] && [ -z "${ZOOKEEPER}" ] && HSTN="kafkaops.whirlpool"

#    local ZKN=$(cat /data/zk 2>/dev/null)
    local ZKN=localhost
    [ -z "${ZKN}" ] && [ ! -z "${ZOOKEEPER}" ] && ZKN="${ZOOKEEPER}"
    [ -z "${ZKN}" ] && [ -z "${ZOOKEEPER}" ] && ZKN="${ZOOKEEPEROPS}"
    [ -z "${ZKN}" ] && ZKN="zookeeper.whirlpool"

    local BID=$(cat /data/brokerid 2>/dev/null)
    [ -z "${BID}" ] && BID=1

    echo "Setting up broker: brokerid=${BID}, hostname=${HSTN}, zookeeper=${ZKN} ..."
    perl -pi -e "s/^#\s*host.name\s*=.*$/host.name=$HSTN/g" $KAFKA_HOME/config/server.properties
    perl -pi -e "s/^\s*broker.id\s*=.*$/broker.id=$BID/g" $KAFKA_HOME/config/server.properties
    perl -pi -e "s/^\s*zookeeper.connect\s*=.*$/zookeeper.connect=localhost:2181/g" $KAFKA_HOME/config/server.properties
    perl -pi -e "s/^\s*log.cleaner.enable\s*=.*$/log.cleaner.enable=true/g" $KAFKA_HOME/config/server.properties
    perl -pi -e "s/^\s*num.partitions\s*=.*$/num.partitions=1/g" $KAFKA_HOME/config/server.properties
    perl -pi -e "s/^\s*num.recovery.threads.per.data.dir\s*=.*$/num.recovery.threads.per.data.dir=4/g" $KAFKA_HOME/config/server.properties
    perl -pi -e "s/^\s*auto.create.topics.enable\s*=.*$/auto.create.topics.enable=false/g" $KAFKA_HOME/config/server.properties
    echo "" >> $KAFKA_HOME/config/server.properties
    echo "delete.topic.enable=true" >> $KAFKA_HOME/config/server.properties
}

function check_kafka() {
    # cqlsh will return an error code if it can't connect to cassandra
    "${KAFKA_HOME}/bin/kafka-topics.sh" --bootstrap-server="${KAFKA_OPS}" --list
}

function kafka_topics() {
    echo "adding kafka topics"

    # wait for kafka to come online
    check_kafka
    ONLINE=$?
    if [ $ONLINE != 0 ]; then
       echo "Waiting for Kafka to come online..."
       RETRIES=10
       until [ $ONLINE == 0 ] || [ $RETRIES == 0 ]; do
          sleep 10
          RETRIES=$RETRIES-1
          check_kafka
          ONLINE=$?
          echo "."
       done
    fi
    if [ $ONLINE != 0 ]; then
       echo "Timed out waiting for Kafka to come online..."
       exit -1
    else
       echo "Kafka is online"
    fi

    export KAFKA_HEAP_OPTS="-Xmx128m -Xms128m"
    export KAFKA_JVM_PERFORMANCE_OPTS="-client -Djava.awt.headless=true"

    RESULT=0

    echo "Creating Kafka Topics..."

    "${KAFKA_HOME}/bin/kafka-topics.sh" --bootstrap-server="${KAFKA_OPS}" --create --partitions 16 --replication-factor ${KAFKA_REPLICATION} --topic "stock-ticker" & PID0=$!
    "${KAFKA_HOME}/bin/kafka-topics.sh" --bootstrap-server="${KAFKA_OPS}" --create --partitions 16 --replication-factor ${KAFKA_REPLICATION} --topic "stock-ticker-cmd" & PID1=$!
    "${KAFKA_HOME}/bin/kafka-topics.sh" --bootstrap-server="${KAFKA_OPS}" --create --partitions 16 --replication-factor ${KAFKA_REPLICATION} --topic "updown" & PID2=$!
    "${KAFKA_HOME}/bin/kafka-topics.sh" --bootstrap-server="${KAFKA_OPS}" --create --partitions 16 --replication-factor ${KAFKA_REPLICATION} --topic "updown-cmd" & PID3=$!
    "${KAFKA_HOME}/bin/kafka-topics.sh" --bootstrap-server="${KAFKA_OPS}" --create --partitions 16 --replication-factor ${KAFKA_REPLICATION} --topic "weather" & PID4=$!
    "${KAFKA_HOME}/bin/kafka-topics.sh" --bootstrap-server="${KAFKA_OPS}" --create --partitions 16 --replication-factor ${KAFKA_REPLICATION} --topic "weather-cmd" & PID5=$!

    wait $PID0; RESULT=$(($RESULT | $?))
    wait $PID1; RESULT=$(($RESULT | $?))
    wait $PID2; RESULT=$(($RESULT | $?))
    wait $PID3; RESULT=$(($RESULT | $?))
    wait $PID4; RESULT=$(($RESULT | $?))
    wait $PID5; RESULT=$(($RESULT | $?))

    echo "DONE!"
    if [ $RESULT == 0 ]; then
       echo "Kafka topics successfully provisioned!"
    else
       echo "ERROR Provisioning Kafka topics, see log for more details"
    fi
}

function zk_kafka() {
    export KAFKA_SCALA_VERSION=2.13
    export KAFKA_VERSION=3.3.1

    echo "Removing previous installation of Kafka and Zookeeper"
    rm -rf /opt/kafka_${KAFKA_SCALA_VERSION}-${KAFKA_VERSION}
    rm -rf /opt/kafka

    # axe kafka logs
    echo "Removing Kafka logs"
    rm -rf /tmp/kafka-logs

    # axe temp Zk data
    echo "Removing Zookeeper data"
    rm -rf /tmp/zookeeper

    echo "Installing version ${KAFKA_SCALA_VERSION}-${KAFKA_VERSION} of Kafka and Zookeeper..."

    # Install Kafka, which also installs Zookeeper
    if [ ! -f /tmp/kafka_${KAFKA_SCALA_VERSION}-${KAFKA_VERSION}.tgz ]; then
        curl -# -L -o /tmp/kafka_${KAFKA_SCALA_VERSION}-${KAFKA_VERSION}.tgz https://dlcdn.apache.org/kafka/${KAFKA_VERSION}/kafka_${KAFKA_SCALA_VERSION}-${KAFKA_VERSION}.tgz
    fi

    tar xfz /tmp/kafka_${KAFKA_SCALA_VERSION}-${KAFKA_VERSION}.tgz -C /opt
    ln -s /opt/kafka_${KAFKA_SCALA_VERSION}-${KAFKA_VERSION} /opt/kafka

    export KAFKA_HOME=/opt/kafka
    export KAFKA_OPS=localhost:9092
    export KAFKA_REPLICATION=1
    export KAFKA_HSIZE=704

    export ZOOKEEPER_HOME=/opt/kafka
    export ZOOKEEPER=localhost:2181
    export ZOOKEEPEROPS=localhost:2181

    zookeeper_init
    kafka_init

    echo "Starting Apache Zookeeper Server..."
    x-terminal-emulator -e "${ZOOKEEPER_HOME}/bin/zookeeper-server-start.sh ${ZOOKEEPER_HOME}/config/zoo.cfg" &

    export KAFKA_HEAP_OPTS="-Xmx${KAFKA_HSIZE}m -Xms${KAFKA_HSIZE}m"
    export KAFKA_JVM_PERFORMANCE_OPTS="-server -XX:+UseG1GC -XX:MaxGCPauseMillis=20 -XX:InitiatingHeapOccupancyPercent=35 -Djava.awt.headless=true"

    echo "Starting Apache Kafka Server ($KAFKA_HEAP_OPTS)..."
    x-terminal-emulator -e "${KAFKA_HOME}/bin/kafka-server-start.sh ${KAFKA_HOME}/config/server.properties" &

    kafka_topics
}

function build_services {
    mvn package
}

function start_services {
    echo "Starting Stock Service"
    x-terminal-emulator -e ./stockservice/target/stockservice &
    echo "Starting UpDown Service"
    x-terminal-emulator -e ./updownservice/target/updownservice &
    echo "Starting Weather Service"
    x-terminal-emulator -e ./weatherservice/target/weatherservice &
    echo "Starting Whirlpool Server"
    cd whirlpoolserver
    x-terminal-emulator -e "./target/whirlpoolserver" &
    cd ..
}

# check for required tools
echo "Checking for maven"
which mvn
if [ $? -eq 0 ]; then
   version=$("mvn" -v 2>&1 | awk -F ' ' '/Apache Maven/ {print $3}')
   if [ "${version:0:1}" == "3" ] ;
   then
     echo "Maven version 3 found: $version"
   else
     echo "Maven incorrect version $version"
     exit 1
   fi
else
   echo "Maven not found. Maven 3 is required."
   exit 1
fi

echo "Checking for Java"
which java
if [ $? -eq 0 ]; then
   version=$("java" -version 2>&1 | awk -F '"' '/version/ {print $2}')
   if [ "${version:0:3}" == "1.8" ] ;
   then
     echo "Java version 8 found: $version"
   else
     echo "Java incorrect version $version"
     exit 1
   fi
else
   echo "Java not found. Java 8 is required. Java 9 or higher will not work."
   exit 1
fi

# find our local ip
export MY_LOCAL_IP=$(hostname -I | perl -nle'/(^\S*)/ && print $1')
echo "Local IP is $MY_LOCAL_IP"

# Fire up the platform.
echo "Starting whirlpool"

# Zookeeper comes with Kafka, so install, configure, and start both
zk_kafka

# run mvn package to create all services and servers
build_services

# start services
start_services

echo "Whirlpool Ready To Go!"
