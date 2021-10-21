#!/bin/bash

# Warning...this politely kills any java or gulp process, with the expectation that you
# are rebuilding from scratch using maclocal_run.sh. We shut down nicely.

# don't kill Zk or Kafka yet
echo "be patient, killing all services and servers"
kill -9 $(ps -e | awk '/[j]ava|[g]ulp/{print $1}')
result=$(ps -e | awk '/[j]ava|[g]ulp/{print $1}')
until [ -z "$result" ]; do
  sleep 5
  echo "waiting..."
  result=$(ps -e | awk '/[j]ava|[g]ulp/{print $1}')
done

# axe kafka logs
echo "Removing Kafka logs"
rm -rf /tmp/kafka-logs

# axe temp Zk data
echo "Removing Zookeeper data"
rm -rf /tmp/zookeeper

echo "done!"
