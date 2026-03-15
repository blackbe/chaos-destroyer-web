# HEARTBEAT.md - Periodic Checks

## Status Check Interval

**Every 4 hours** (changed from hourly on 2026-03-14 to reduce API usage and budget burn)

## Active Heartbeat Daemon

**DISABLED** as of 2026-03-14 14:07 PST due to budget bleed (~$0.09/hour cost)

### What's Being Checked

1. **Email** - Asks Ollama to scan for urgent messages
   - Alerts if something marked "important" or from key contacts
   
2. **Calendar** - Checks for upcoming events in next 24h
   - Alerts if events in next 2 hours
   
3. **Weather** - Current conditions at location
   - Info only, alerts on severe weather

### How to Use

The daemon runs automatically every 30 minutes. Alerts are sent via WhatsApp if:
- Urgent email detected
- Important calendar event coming up
- Severe weather warning

### Logs

- **Main log:** `/Users/benblack/.openclaw/logs/heartbeat.log`
- **Error log:** `/Users/benblack/.openclaw/logs/heartbeat.err.log`
- **Data log:** `/Users/benblack/.openclaw/.heartbeat-log.json`

### Cost

**Free** - Uses local Ollama, no API calls
