# Unified Nightly Builder - Quick Reference

## View Backlog
```bash
cat ~/.openclaw/workspace/nightly-builds/UNIFIED-BACKLOG.md
```

## Check Launchd Status
```bash
launchctl list | grep minimi
```

## View Latest Build
```bash
ls -ltr ~/.openclaw/workspace/nightly-builds/outputs/ | tail -1
```

## View Build Logs
```bash
tail -50 ~/.openclaw/workspace/nightly-builds/logs/unified-nightly.log
```

## Run Builder Manually (for testing)
```bash
~/.openclaw/workspace/nightly-builds/scripts/unified-nightly-builder.sh
```

## Add a New Task to Backlog
Edit `~/.openclaw/workspace/nightly-builds/UNIFIED-BACKLOG.md` and add a line:
```
[ ] [HUGBACK] Your feature here
[ ] [CHAOS-DESTROYER] Your project here
```

## Mark Task as Skipped
Change `[ ]` to `[s]` in the backlog.

## Re-run a Completed Task
Change `[x]` back to `[ ]` in the backlog.

## HugBack Repo Status
```bash
cd ~/hugback && git status
```
(Should be clean, no nightly infrastructure)

## Integration Request
When you want to merge a HugBack feature:
1. Find the output folder: `~/.openclaw/workspace/nightly-builds/outputs/YYYY-MM-DD-hugback-N/`
2. Review the code
3. Tell Minimi: "Merge HugBack feature #N"
4. Minimi handles copying, testing, committing, pushing
