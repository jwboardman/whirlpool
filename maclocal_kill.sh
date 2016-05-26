#!/bin/bash

# Warning...this politely kills any java or gulp process, with the expectation that you
# are rebuilding from scratch using maclocal_run.sh. We shut down nicely.

# don't kill Zk or Kafka yet
echo "be patient, killing all services and servers except Zookeeper and Kafka"
kill $(ps | grep -v '[Q]uorumPeerMain\|[k]afka\.Kafka' | awk '/[j]ava|[g]ulp/{print $1}')
while ps | grep -v '[Q]uorumPeerMain\|[k]afka\.Kafka' | grep '[j]ava\|[g]ulp' > /dev/null; do echo "waiting..."; sleep 5; done

echo "All dead, killing Kafka"
kill $(ps | awk '/[k]afka\.Kafka/{print $1}')
while ps | grep '[k]afka\.Kafka' > /dev/null; do echo "waiting..."; sleep 1; done

echo "Kafka dead, killing Zookeeper"
kill $(ps | awk '/[Q]uorumPeerMain/{print $1}')
while ps | grep '[Q]uorumPeerMain' > /dev/null; do echo "waiting..."; sleep 1; done

# axe kafka logs
echo "Removing Kafka logs"
rm -rf /tmp/kafka-logs

# axe temp Zk data
echo "Removing Zookeeper data"
rm -rf /tmp/zookeeper

# find all terminal windows
# loop through all terminal windows
# find all tabs for the current terminal window
# send command-shift-right arrow to skip the first tab, which we don't want to close
# loop through tabs 2-n
# send command-w to close the tab

osascript <<EOD
system attribute
tell application "Terminal"
  set allWindows to number of windows
  repeat with i from 1 to allWindows
    set allTabs to number of tabs of window i
      tell application "System Events"
        key code 124 using {shift down, command down}
      end tell
    repeat with j from 1 to allTabs - 1
      tell application "System Events"
        keystroke "w" using {command down}
      end tell
    end repeat
  end repeat
end tell
EOD
echo "done!"
