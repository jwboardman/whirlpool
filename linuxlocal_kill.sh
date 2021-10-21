#!/bin/bash

# Warning...this politely kills any java or gulp process, with the expectation that you
# are rebuilding from scratch using linuxlocal_run.sh. We shut down nicely.

# don't kill Zk or Kafka yet
echo "be patient, killing all services and servers except Zookeeper and Kafka"
kill $(ps -e | grep -v '[Q]uorumPeerMain\|[k]afka\.Kafka' | awk '/[j]ava|[g]ulp/{print $1}')
while ps -e | grep -v '[Q]uorumPeerMain\|[k]afka\.Kafka' | grep '[j]ava\|[g]ulp' > /dev/null; do echo "waiting..."; sleep 5; done

echo "All dead, killing Kafka"
kill $(ps -e | awk '/[k]afka\.Kafka/{print $1}')
while ps -e | grep '[k]afka\.Kafka' > /dev/null; do echo "waiting..."; sleep 1; done

echo "Kafka dead, killing Zookeeper"
kill $(ps -e | awk '/[Q]uorumPeerMain/{print $1}')
while ps -e | grep '[Q]uorumPeerMain' > /dev/null; do echo "waiting..."; sleep 1; done

# axe kafka logs
echo "Removing Kafka logs"
rm -rf /tmp/kafka-logs

# axe temp Zk data
echo "Removing Zookeeper data"
rm -rf /tmp/zookeeper

echo "done!"
