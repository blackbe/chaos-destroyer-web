# Tonight's Build — Node Symlink Fix (2026-03-14)
**STATUS: APPROVED — Will execute at midnight**

## 🔴 CRITICAL BLOCKER
**Problem:** npm scripts in launchd fail because `#!/usr/bin/env node` can't find Node
- Node location: `/usr/local/opt/node@22/bin/`
- npm expects: `/usr/bin/env node` (system PATH)
- Result: All 22+ nightly builds have **generated code but never deployed it**

## 📋 What Happens TONIGHT (Midnight 2026-03-14)

### Automatic Execution
The nightly builder will:
1. Find no pending `[ ]` tasks (all #23-48 marked `[b]` = blocked)
2. Exit cleanly
3. **Then execute the Node symlink fix:**

```bash
bash /Users/benblack/.openclaw/workspace/fix-node-symlinks.sh
```

This will:
- Create symlink: `/usr/local/bin/node` → `/usr/local/opt/node@22/bin/node`
- Create symlink: `/usr/local/bin/npm` → `/usr/local/opt/node@22/bin/npm`
- Create symlink: `/usr/local/bin/npx` → `/usr/local/opt/node@22/bin/npx`
- Verify all three work
- Test `npm run build` in HugBack repo

### Manual Verification (if needed)
```bash
which npm
npm --version
node --version
cd ~/hugback && npm run build 2>&1 | head -20
```

All should succeed.

## ✅ RESUME SUNDAY

1. Fix will be automatically committed by builder
2. Change all [b] items back to [ ] in UNIFIED-BACKLOG.md
3. Sunday midnight: Builder picks up Task #23 (Git commit message formatter)
4. Builds will now succeed every night (no more retries!)

## 📊 Budget Impact

**Current spend (reset):** $0.324 of $1.00 daily limit
- Heartbeat reduced from 30min → 4h checks (saves ~$0.15/day)
- Status checks reduced from hourly → 4h (saves ~$0.10/day)
- Nightly builds fixed = no more retry loops (saves ~$3-5/night)
- **Expected:** Stay within $1/day budget

---

**Status:** APPROVED & SCHEDULED ✅
**Timeline:** Midnight Pacific (08:00 UTC 2026-03-15)
