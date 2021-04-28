#!/usr/bin/env bash

## only for CI; on OSX use 3rd_party/sc-4.6.5-osx.zip

tar xzf 3rd_party/sc-4.6.5-linux.tar.gz
nohup sc-4.6.5-linux/bin/sc --pidfile sc.pid 1>/dev/null 2>/dev/null &
