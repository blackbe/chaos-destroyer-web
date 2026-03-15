#!/bin/bash

export OPENCLAW_GATEWAY_TOKEN="75261c82518126b524fb2baa202fb3cacc9748a57b0fc51e"

exec /usr/local/opt/node@22/bin/node /Users/benblack/.openclaw/workspace/heartbeat-daemon.js "$@"
