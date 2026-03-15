# iMessage Active Listening Daemon Setup

## Problem
OpenClaw's Gateway was using polling (every 5-10 seconds) to check for new iMessages, causing:
- Missed messages
- Delayed delivery
- Inconsistent "every other message" pattern

## Root Cause
Apple Watch interference with iCloud Messages sync + Gateway polling gaps meant some messages arrived between polling cycles.

## Solution Built
Created an active listener daemon that:
1. **Runs `imsg watch`** directly (streaming listener)
2. **Parses messages in real-time** as they arrive
3. **Posts to Gateway API** immediately (no polling gaps)

## Files Created
- `/Users/benblack/.openclaw/imessage-daemon.js` — Main daemon (Node.js)
- `/Users/benblack/.openclaw/run-imessage-daemon.sh` — Wrapper script
- `/Users/benblack/Library/LaunchAgents/com.openclaw.imessage-daemon.plist` — launchd service

## Installation
Service auto-loads on login via launchd. Current status:
- Daemon: Running (`imsg watch` subprocess active at PID 69944)
- Gateway: Listening on localhost:18789
- Ready to test

## Testing
Sent test messages from phone to verify delivery to OpenClaw chat. If working:
- Message appears in iMessage history (`imsg history`)
- Message posted to Gateway API immediately
- Message shows up in OpenClaw chat session without delay

## Next Steps
1. Test with real messages
2. Monitor `/tmp/imessage-daemon.log` for API call successes/errors
3. If working, can remove polling-based receiver from Gateway config

## Fixes Applied During Session
1. Disabled iMessage on Apple Watch (was causing sync delays)
2. Added Full Disk Access to Messages app
3. Fixed OpenClaw config errors via `openclaw doctor --fix`
4. Built active listener daemon as alternative to polling
