# MEMORY.md — Minimi's Long-Term Memory

## About Ben
- **Name:** Ben Black
- **Phone:** +15038662111
- **Location:** Tigard/Portland, Oregon
- **Email:** benjamin.black75@gmail.com
- **GitHub:** github.com/blackbe
- **LinkedIn:** linkedin.com/in/benkblack
- **Pronouns:** he/him
- **Timezone:** America/Los_Angeles

## Work History
- **Centene** (Dec 2024–Dec 2026): QA Automation Engineer via Randstad. Built Playwright/TS/AWS framework from scratch. Reduced 5-day test suite to <4 hours. Selected for AI Pilot Program (Windsurf). **Contract extended to 12/31/2026** (was 3/31/2026). Full-time negotiation decision point: October 2026.
- **Knipe Realty** (Oct 2019–Dec 2024): 5 years QA on CRM software
- **U.S. Bank** (Oct 2018–Oct 2019): Senior Automation Tester, Java/Selenium, 200+ test cases automated
- **AWS Elemental** (Jan 2014–Oct 2018): 4yr 10mo. Video streaming QA, iOS/Android/web, CI/CD. Patent holder.
- **Haivision** (May 2013–Jan 2014): Test engineer, Android set-top box
- **Intel/Omedia** (Jan–Apr 2012): Data analyst, Android Medfield chip benchmarking

## Education
- BS Computer Science — Oregon State (Dec 2014)
- BA Social Sciences w/ Business — Washington State (2006)
- AS Computer Science — Portland Community College (Dec 2013)

## Patent
- "Elastic Cloud Storage Tuned for Video Content" — Amazon

## Key Skills
- Playwright, TypeScript, Node.js, AWS (S3, CloudWatch, Lambda), CI/CD
- Java, Selenium, Python
- CSV streaming, iframe navigation, API testing
- IAM / network security expertise

## Goals
- Full-time at Centene or Netflix SDET 4 (Account & Security Experiences, $200k-$300k) — dream job
- Full-time employment by Oct 2026 (negotiation decision point)
- HugBack app (React + Supabase, mental health)
- Financial recovery ($26k lawyer, $36k to mom, credit cards)
- Reconnect with estranged child (they/them)
- Therapy Tuesdays (self-confidence, childhood trauma, ADHD)
- West Coast Swing — exit Novice level
- Body Language Mastery
- MTG Commander deck building
- Dominion Mondays

## Personality
- Has ADHD (suspected/exploring)
- Values time highly
- Responds to directness and action
- Wants overnight surprise builds
- Ambitious, many projects at once

## Preferences
- Wants nightly Codex CLI builds ✅ **LIVE as of 2026-02-25**
- Wants proactive help, not questions
- Direct communication style
- Quick morning summaries (bullets only)
- No Netflix work (STOP asking)

## Decision Authority (2026-02-25)
- ✅ Merge nightly builds to main if tests pass
- ✅ Deploy to Vercel without approval
- ✅ Push migrations to Supabase
- 💰 Budget-first (batch work if money tight, not time-constrained)
- 3h max per nightly build
- Free tier services only

## Do NOT Interrupt When
- Sleeping
- At work
- Dancing
(All other times OK)

## Unified Nightly Build System (Active - Ollama llama3.2:3b)
- **Single Builder:** `~/.openclaw/workspace/nightly-builds/scripts/unified-nightly-builder.sh`
- **Schedule:** 00:00 (midnight) daily
- **Model:** Ollama llama3.2:3b (FREE, local)
- **Backlog:** `~/.openclaw/workspace/nightly-builds/UNIFIED-BACKLOG.md` 
- **Output:** `~/.openclaw/workspace/nightly-builds/outputs/YYYY-MM-DD-{hugback|chaos-destroyer}-N/`
- **Status:** 🟢 **ONLINE & SHIPPING (2026-04-07 12:05 PM)**
- **Today's Wins (2026-04-07):**
  - ✅ Fixed & shipped Task #46 (Support board) — manually fixed App.js/index.js, committed & pushed
  - ✅ Fixed & shipped Task #48 (Real-time chat) — same fix, now in production
  - ✅ Built & shipped Task #50 (Meetup coordination) — created MeetupCoordination component, API routes, integrated to Navbar, deployed to Vercel
  - ✅ Generated Task #51 (MTG deck builder) — Chaos Destroyer project, code generated & documented
- **Script Improvements (2026-04-07):**
  - Completion gating: tasks only mark `[x]` if build AND push both succeed (prevents shipping broken code)
  - Morning summaries now show ✅ SHIPPED or ⚠️ BUILD FAILED status
- **Progress:** 31/83 tasks complete (37% shipped!). Task #50 brings HugBack to 22 deployed features.
- **Budget Status:** $0.027/$1.00 spent (plenty of room)
- **Next:** Task #52 (HugBack - AI moderation system) or Task #53 (Body language mastery curriculum)

### Project Separation (2026-03-08)
- **HugBack repo:** Clean (src/, backend/, package.json only) — nightly infrastructure removed
- **Chaos Destroyer:** Lives in OpenClaw workspace (~/.openclaw/workspace/chaos-destroyer/)
- **Infrastructure:** All in OpenClaw workspace (daemons, scripts, backlog, logs)

## HugBack Launch Plan
- **Target date:** March 31, 2026 (35 days)
- **MVP users:** People who need support most (mental health, crisis)
- **Infrastructure:** Supabase live, need deployment pipeline
- **Legal:** No lawyer yet (Ben to find)
- **Metrics to track:** Features/night, lines of code, budget spent

## Code Quality Standards
- No tests (Ben handles work tests)
- "Working code" = no failures/errors
- Focus: Shipped features, not TDD
- Quick iterations over perfect code

## Real Budget Daemon (2026-02-22 - FIXED)
- Set up real API spend tracking (queries Anthropic API)
- Runs every 2 hours, checks actual usage against $1 daily limit
- Warns at $0.75 (75% threshold) via WhatsApp
- Stops work if exceeding $1/day
- Loads credentials from `/Users/benblack/.env` (600 permissions, owner-only)
- Daemon: `budget-monitor-real.js`
- Logs: `/Users/benblack/.openclaw/.budget-log-real.json`

### API Key Rotation
- **Reminder:** Monthly on 1st of month (Apple Reminders)
- **Current key:** openClawV2 (V3 created 2026-02-22)
- **Procedure:** Create new key in Anthropic console, update ANTHROPIC_API_KEY in ~/.env, delete old key
- **Last rotated:** 2026-02-22

## Provider Strategy (2026-02-26)
**Switched to multi-provider approach to save costs:**
- **Ollama (llama3.2:3b)** → Heartbeat daemon (FREE, local)
- **OpenAI gpt-4o-mini** → Nightly builds (CHEAP, ~$0.019 per 10k tokens)
- **Claude Sonnet** → Heavy lifting only (Netflix resume, complex reasoning)

**Cost comparison:**
- Claude Haiku: $0.80 per 1M input tokens
- OpenAI gpt-4o-mini: $0.15 per 1M input tokens (5.3x cheaper)
- Ollama: FREE (local)

**Savings:** ~$15-20/month switching to OpenAI for nightly builds

## Known Issues & Fixes (2026-02-27)

### Heartbeat Daemon Budget Bleed (🟢 FIXED)
- **Issue:** Heartbeat daemon was firing every 30 min, costing ~$0.04/cycle (~$10+/day)
- **Cause:** Daemon was hitting remote APIs instead of local Ollama (unclear why)
- **Fix:** OpenClaw updated to v2026.2.26 (includes heartbeat optimization fixes)
- **WhatsApp pairing:** Fixed — was breaking alert routing
- **Action taken:** Disabled heartbeat until midnight 2026-02-27 to stop budget bleed
- **TODO (midnight):** Re-enable heartbeat and verify it uses local Ollama (should be free now)
- **Budget damage:** $1.922 overage on 2026-02-27 (resets at midnight)

## Heartbeat Daemon (2026-02-21 — Status: DISABLED 2026-03-14 14:07)
- ❌ **DISABLED** due to budget bleed (same issue as 2026-02-27)
- Root cause: Daemon polling every 30 min = ~$0.09/hour burn rate
- Cost: $1.955 overage by 2:07 PM (4 hours into day)
- Action taken: `launchctl unload` at 2026-03-14 14:07 PST to stop bleeding
- Timeline: Will re-enable after budget reset at midnight UTC
- **Interval (when re-enabled):** Every 4 hours (changed from 30 min on 2026-03-14)
- Service: `com.openclaw.heartbeat` (launchd)
- Logs: `/Users/benblack/.openclaw/logs/heartbeat.log`
- Data: `/Users/benblack/.openclaw/.heartbeat-log.json`

### Daemon Health Checks
**Quick check (is service loaded?):**
```bash
launchctl list | grep heartbeat
```

**Check if process is running:**
```bash
ps aux | grep heartbeat-daemon
```

**View live logs:**
```bash
tail -f /Users/benblack/.openclaw/logs/heartbeat.log
```

**Check data log (recent checks):**
```bash
cat /Users/benblack/.openclaw/.heartbeat-log.json
```

**Full diagnostic (both daemons):**
```bash
echo "=== HEARTBEAT ===" && launchctl list | grep heartbeat && echo "=== BUDGET ===" && launchctl list | grep budget
```

**Restart if crashed:**
```bash
launchctl unload /Users/benblack/Library/LaunchAgents/com.openclaw.heartbeat.plist && sleep 1 && launchctl load /Users/benblack/Library/LaunchAgents/com.openclaw.heartbeat.plist
```

**Run weekly to verify both daemons healthy:**
```bash
launchctl list | grep -E "heartbeat|budget"
```
(If PID is -1, daemon crashed and needs restart)
