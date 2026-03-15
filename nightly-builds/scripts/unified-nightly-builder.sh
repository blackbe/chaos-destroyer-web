#!/bin/bash
# ===========================================
# Unified Nightly Builder (Minimi)
# Builds HugBack features AND Chaos Destroyer tasks
# Single builder, one backlog, smart routing
# ===========================================

set -e

# ── Config ──────────────────────────────────
WORKSPACE_DIR="$HOME/.openclaw/workspace"
NIGHTLY_DIR="$WORKSPACE_DIR/nightly-builds"
BACKLOG="$NIGHTLY_DIR/UNIFIED-BACKLOG.md"
OUTPUT_DIR="$NIGHTLY_DIR/outputs"
LOG_DIR="$NIGHTLY_DIR/logs"
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

# ── Setup dirs ──────────────────────────────
mkdir -p "$OUTPUT_DIR" "$LOG_DIR"

# ── Ensure npm is in PATH ───────────────────
export PATH="/usr/local/opt/node@22/bin:$PATH"

# ── Find next pending task (skip blocked [b] items) ───────
NEXT_TASK=$(grep -n '^\[ \]' "$BACKLOG" | head -1)

if [ -z "$NEXT_TASK" ]; then
  echo "[$TIMESTAMP] No pending tasks (all completed or blocked)" >> "$LOG_DIR/unified-nightly.log"
  
  # ── Check if Node symlink fix is needed ──────────────────
  if [ ! -L "/usr/local/bin/node" ]; then
    echo "[$TIMESTAMP] ⚠️ Node symlink not found — running fix-node-symlinks.sh" >> "$LOG_DIR/unified-nightly.log"
    
    FIX_SCRIPT="$WORKSPACE_DIR/fix-node-symlinks.sh"
    if [ -f "$FIX_SCRIPT" ]; then
      echo "[$TIMESTAMP] Executing Node symlink fix..." >> "$LOG_DIR/unified-nightly.log"
      bash "$FIX_SCRIPT" >> "$LOG_DIR/unified-nightly.log" 2>&1
      
      # Verify fix
      if command -v npm &> /dev/null && [ -L "/usr/local/bin/node" ]; then
        echo "[$TIMESTAMP] ✅ Node symlink fix completed successfully" >> "$LOG_DIR/unified-nightly.log"
        
        # Commit the fix (documentation only, no new code)
        cd "$WORKSPACE_DIR"
        git add fix-node-symlinks.sh TONIGHT-FIX-NODE.md
        git commit -m "fix: Apply Node symlinks for launchd npm compatibility (2026-03-15)" 2>/dev/null || true
        git push origin main >> "$LOG_DIR/unified-nightly.log" 2>&1
      else
        echo "[$TIMESTAMP] ❌ Node symlink fix failed — manual intervention needed" >> "$LOG_DIR/unified-nightly.log"
      fi
    else
      echo "[$TIMESTAMP] ⚠️ Fix script not found at $FIX_SCRIPT" >> "$LOG_DIR/unified-nightly.log"
    fi
  else
    echo "[$TIMESTAMP] ✅ Node symlinks already present — ready to resume builds" >> "$LOG_DIR/unified-nightly.log"
  fi
  
  exit 0
fi

# Extract line number, task number, tag, and description
LINE_NUM=$(echo "$NEXT_TASK" | cut -d: -f1)
FULL_LINE=$(echo "$NEXT_TASK" | cut -d: -f2-)

# Extract tag [HUGBACK] or [CHAOS-DESTROYER]
TAG=$(echo "$FULL_LINE" | sed -E 's/.*\[([A-Z-]+)\].*/\1/')
TASK_NUM=$(echo "$FULL_LINE" | sed -E 's/^.*\] ([0-9]+)\..*/\1/')
TASK_DESC=$(echo "$FULL_LINE" | sed -E 's/^.*\] [0-9]+\. \[.*\] //')

echo "[$TIMESTAMP] Starting task #$TASK_NUM [$TAG]: $TASK_DESC" >> "$LOG_DIR/unified-nightly.log"

# ── Determine output location based on tag ──
case "$TAG" in
  HUGBACK)
    PROJECT_DIR="$HOME/hugback"
    OUTPUT_SUBDIR="hugback"
    PROJECT_TYPE="HugBack Feature"
    ;;
  CHAOS-DESTROYER)
    PROJECT_DIR="$WORKSPACE_DIR/chaos-destroyer"
    OUTPUT_SUBDIR="chaos-destroyer"
    PROJECT_TYPE="Chaos Destroyer Project"
    ;;
  *)
    echo "[$TIMESTAMP] ERROR: Unknown tag [$TAG]" >> "$LOG_DIR/unified-nightly.log"
    exit 1
    ;;
esac

# ── Create task-specific output dir ─────────
TASK_DIR="$OUTPUT_DIR/$DATE-$OUTPUT_SUBDIR-$TASK_NUM"
mkdir -p "$TASK_DIR"

# ── Build the prompt (context varies by tag) ──
case "$TAG" in
  HUGBACK)
    PROMPT="You are building the next feature for HugBack, a mental wellness and peer support app.

PROJECT CONTEXT:
- Frontend: React app in ~/hugback/src/ (deployed to Vercel)
- Backend: Node.js/Express in ~/hugback/backend/ (deployed to Railway)
- Database: Supabase PostgreSQL
- Key components: App.js, Login.js, Home.js, Matches.js, Chat.js, Profile.js, HugBoard.js, StoryWall.js
- Design system: Amber (#f59e0b) and cream (#fff3e6) color scheme

YOUR TASK (Feature #$TASK_NUM):
$TASK_DESC

INSTRUCTIONS:
1. Build a complete, testable implementation
2. Save all new files in: $TASK_DIR/
3. Include a README.md with:
   - What you built
   - How to test it
   - Integration steps (where to add it in App.js or relevant files)
   - Any Supabase schema changes needed
4. Create a SCREENSHOTS.md with code examples or visual descriptions
5. If it requires Supabase changes, include a SQL migration file
6. Make it production-ready: error handling, loading states, accessibility
7. Reference existing HugBack code style and patterns
8. Include PropTypes or TypeScript types
9. If it needs a new route, include the Router config
10. Keep scope small — this should be completable in 2-3 hours
11. Use existing HugBack color tokens and styling patterns
12. Mobile-first responsive design

Start building now! Output complete, working code."
    ;;
  CHAOS-DESTROYER)
    PROMPT="You are Minimi, a personal life-organizing assistant. You're building a tool or project for Ben's life organization (Chaos Destroyer).

PROJECT CONTEXT:
- This is Ben's personal workspace: ~/.openclaw/workspace/chaos-destroyer/
- Output goes to: $TASK_DIR/
- Purpose: Tools, trackers, and utilities that help Ben organize his life, not for external use
- You have access to Ben's files, schedules, and personal info (this is private)

YOUR TASK (Project #$TASK_NUM):
$TASK_DESC

INSTRUCTIONS:
1. Build a complete, practical implementation
2. Save all files in: $TASK_DIR/
3. Include a README.md with:
   - What you built
   - How to use it
   - Integration steps (where/how to run)
   - Any setup needed
4. Make it useful: Ben will actually use this
5. Include examples or templates if applicable
6. If it's a tracker/dashboard, include sample data
7. If it needs to integrate with other tools (calendar, email, Supabase), document that
8. Keep it focused and lightweight
9. If it's a script, include error handling and logging

Start building now! Output complete, practical code."
    ;;
esac

# ── Run OpenAI API (gpt-4o-mini) ──────────
cd "$WORKSPACE_DIR"

# Load OpenAI API key from ~/.env
OPENAI_API_KEY=$(grep "^OPENAI_API_KEY=" ~/.env | cut -d= -f2-)

if [ -z "$OPENAI_API_KEY" ]; then
  echo "[$TIMESTAMP] ERROR: OPENAI_API_KEY not found in ~/.env" >> "$LOG_DIR/unified-nightly.log"
  exit 1
fi

echo "[$TIMESTAMP] Invoking OpenAI gpt-4o-mini..." >> "$LOG_DIR/unified-nightly.log"

# Call OpenAI API directly
RESPONSE=$(curl -s https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{
    \"model\": \"gpt-4o-mini\",
    \"messages\": [{
      \"role\": \"user\",
      \"content\": $(echo "$PROMPT" | jq -Rs '.')
    }],
    \"temperature\": 0.7,
    \"max_tokens\": 4000
  }")

# Extract the response text
RESPONSE_TEXT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // .error.message' 2>/dev/null)

# Save the full response for debugging
echo "$RESPONSE" > "$TASK_DIR/openai-response.json"

# Save the generated content
echo "$RESPONSE_TEXT" > "$TASK_DIR/generated-output.md"

# Log the usage
TOKENS_USED=$(echo "$RESPONSE" | jq -r '.usage.total_tokens // "unknown"' 2>/dev/null)
echo "[$TIMESTAMP] Tokens used: $TOKENS_USED" >> "$LOG_DIR/unified-nightly.log"

# ── Mark task as completed ──────────────────
sed -i '' "${LINE_NUM}s/\[ \]/[x]/" "$BACKLOG"

# ── Auto-apply for HUGBACK tasks ────────────
if [ "$TAG" = "HUGBACK" ]; then
  echo "[$TIMESTAMP] Auto-applying HUGBACK changes..." >> "$LOG_DIR/unified-nightly.log"
  
  cd "$PROJECT_DIR"
  
  # Verify project exists
  if [ ! -f "package.json" ]; then
    echo "[$TIMESTAMP] ERROR: HugBack project not found at $PROJECT_DIR" >> "$LOG_DIR/unified-nightly.log"
  else
    # Step 1: Copy generated files to HugBack repo
    if [ -d "$TASK_DIR" ]; then
      echo "[$TIMESTAMP] Copying generated files from $TASK_DIR to $PROJECT_DIR..." >> "$LOG_DIR/unified-nightly.log"
      
      # Copy all .js, .jsx, .ts, .tsx, .css, .sql files (skip markdown summaries)
      find "$TASK_DIR" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.sql" \) 2>/dev/null | while read file; do
        # Determine destination based on filename and context
        FILENAME=$(basename "$file")
        
        # SQL files go to migrations/
        if [[ "$FILENAME" == *.sql ]]; then
          mkdir -p "$PROJECT_DIR/migrations"
          cp "$file" "$PROJECT_DIR/migrations/" 2>/dev/null || true
          echo "[$TIMESTAMP] Copied $FILENAME to migrations/" >> "$LOG_DIR/unified-nightly.log"
        # Component files go to src/components/
        elif [[ "$FILENAME" == *Component* || "$FILENAME" == *component* ]]; then
          mkdir -p "$PROJECT_DIR/src/components"
          cp "$file" "$PROJECT_DIR/src/components/" 2>/dev/null || true
          echo "[$TIMESTAMP] Copied $FILENAME to src/components/" >> "$LOG_DIR/unified-nightly.log"
        # Backend/routes go to backend/
        elif [[ "$FILENAME" == *route* || "$FILENAME" == *routes* ]]; then
          mkdir -p "$PROJECT_DIR/backend/routes"
          cp "$file" "$PROJECT_DIR/backend/routes/" 2>/dev/null || true
          echo "[$TIMESTAMP] Copied $FILENAME to backend/routes/" >> "$LOG_DIR/unified-nightly.log"
        # Utils go to src/utils/
        elif [[ "$FILENAME" == *util* || "$FILENAME" == *helper* ]]; then
          mkdir -p "$PROJECT_DIR/src/utils"
          cp "$file" "$PROJECT_DIR/src/utils/" 2>/dev/null || true
          echo "[$TIMESTAMP] Copied $FILENAME to src/utils/" >> "$LOG_DIR/unified-nightly.log"
        # Everything else goes to src/
        else
          cp "$file" "$PROJECT_DIR/src/" 2>/dev/null || true
          echo "[$TIMESTAMP] Copied $FILENAME to src/" >> "$LOG_DIR/unified-nightly.log"
        fi
      done
    fi
    
    # Step 2: Run build to verify no errors (use full path to npm)
    echo "[$TIMESTAMP] Running npm run build to verify..." >> "$LOG_DIR/unified-nightly.log"
    if /usr/local/opt/node@22/bin/npm run build >> "$LOG_DIR/unified-nightly.log" 2>&1; then
      echo "[$TIMESTAMP] ✅ Build succeeded" >> "$LOG_DIR/unified-nightly.log"
      
      # Step 3: Git commit and push
      echo "[$TIMESTAMP] Committing changes to git..." >> "$LOG_DIR/unified-nightly.log"
      
      git add -A
      COMMIT_MSG="feat: Integrate nightly build task #$TASK_NUM - $TASK_DESC"
      git commit -m "$COMMIT_MSG" 2>/dev/null || echo "[$TIMESTAMP] No changes to commit or commit failed" >> "$LOG_DIR/unified-nightly.log"
      
      # Push to main
      echo "[$TIMESTAMP] Pushing to main branch..." >> "$LOG_DIR/unified-nightly.log"
      if git push origin main >> "$LOG_DIR/unified-nightly.log" 2>&1; then
        echo "[$TIMESTAMP] ✅ Pushed to main" >> "$LOG_DIR/unified-nightly.log"
        
        # Step 4: Trigger Vercel deployment
        echo "[$TIMESTAMP] Vercel will auto-deploy from git push" >> "$LOG_DIR/unified-nightly.log"
      else
        echo "[$TIMESTAMP] ⚠️ Push failed (check git status)" >> "$LOG_DIR/unified-nightly.log"
      fi
    else
      echo "[$TIMESTAMP] ❌ Build failed - review errors in log" >> "$LOG_DIR/unified-nightly.log"
    fi
  fi
  
  cd "$WORKSPACE_DIR"
fi

# ── Log completion ──────────────────────────
echo "[$TIMESTAMP] Completed task #$TASK_NUM [$TAG]. Output in $TASK_DIR/" >> "$LOG_DIR/unified-nightly.log"
echo "[$TIMESTAMP] ──────────────────────────────" >> "$LOG_DIR/unified-nightly.log"

# ── Summary file for morning review ─────────
cat > "$TASK_DIR/MORNING-SUMMARY.md" << EOF
# 🌅 Good Morning, Ben!

## Tonight I built: $PROJECT_TYPE #$TASK_NUM
**$TASK_DESC**

**Date:** $DATE  
**Output location:** \`$TASK_DIR/\`

### What to review:
1. **README.md** — What was built and how to use/integrate it
2. **generated-output.md** — The full build output
3. **Integration steps** — Follow README.md for next steps

### How to test:
1. For HUGBACK tasks: Files auto-copied to ~/hugback/, build verified, committed to git, pushed to main
2. Check HugBack deploy status: https://vercel.com/dashboard (auto-deploys on git push)
3. Review files in \`$TASK_DIR/\` for the original output
4. Check git log for commit: \`cd ~/hugback && git log --oneline -1\`

### Next task on the backlog:
\`\`\`
$(grep '^\[ \]' "$BACKLOG" | head -3 | sed 's/^\[ \] //')
\`\`\`

---
*Built automatically by Minimi's Unified Nightly Builder* ⚡  
*Output for: [$TAG]*
EOF

echo "✅ Done! Check $TASK_DIR/ for results."
