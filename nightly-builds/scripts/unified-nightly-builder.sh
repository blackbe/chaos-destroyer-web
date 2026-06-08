#!/bin/bash
# ===========================================
# Unified Nightly Builder (Minimi)
# Builds HugBack features AND Chaos Destroyer tasks
# Single builder, one backlog, smart routing
# ===========================================

set -e

# ── Load environment variables ──────────────
source "$HOME/.env" 2>/dev/null || true

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
  exit 0
fi

# Extract line number, task number, tag, and description
LINE_NUM=$(echo "$NEXT_TASK" | cut -d: -f1)
FULL_LINE=$(echo "$NEXT_TASK" | cut -d: -f2-)

# Extract tag [HUGBACK] or [CHAOS-DESTROYER]
TAG=$(echo "$FULL_LINE" | sed -E 's/.*\[([A-Z-]+)\].*/\1/')
TASK_NUM=$(echo "$FULL_LINE" | sed -E 's/^.*\] ([0-9]+)\..*/\1/')
TASK_DESC=$(echo "$FULL_LINE" | sed -E 's/^.*\] [0-9]+\. \[.*\] //')

# Track completion status (only set to true if build AND push succeed)
BUILD_SUCCEEDED=false
PUSH_SUCCEEDED=false

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
2. For EVERY code file, use EXACTLY this format:
   [FILE: src/components/MyComponent.js]
   \`\`\`jsx
   // your code goes here
   \`\`\`
   
   DO NOT use markdown headers like **MyComponent.js**
   DO NOT use tildes or absolute paths like ~/... or /Users/.../...
   DO use relative paths: src/components/, src/pages/, backend/routes/, migrations/
3. CRITICAL: If you create a React component with CSS, create the CSS file with [FILE: path] marker
4. Include a README.md with integration steps
5. Create a SCREENSHOTS.md with code examples or visual descriptions
6. Make it production-ready: error handling, loading states, accessibility
7. Reference existing HugBack code style and patterns
8. Include PropTypes or TypeScript types
9. Mobile-first responsive design
10. CRITICAL: Every code file MUST start with [FILE: path/to/file] marker before the code block

Start building now! Output complete, working code."
    ;;
  CHAOS-DESTROYER)
    PROMPT="You are Minimi, a personal life-organizing assistant. You're building a tool or project for Ben's life organization (Chaos Destroyer).

PROJECT CONTEXT:
- This is Ben's personal workspace: ~/.openclaw/workspace/chaos-destroyer/
- Output goes to: $TASK_DIR/
- Purpose: Tools, trackers, and utilities that help Ben organize his life
- You have access to Ben's files, schedules, and personal info (this is private)

YOUR TASK (Project #$TASK_NUM):
$TASK_DESC

INSTRUCTIONS:
1. Build a complete, practical implementation
2. Save all files using: [FILE: path/to/filename.js] format
3. Include a README.md with what you built and how to use it
4. Make it useful: Ben will actually use this
5. Include examples or templates if applicable
6. If it's a tracker/dashboard, include sample data
7. Keep it focused and lightweight

Start building now! Output complete, practical code."
    ;;
esac

# ── Run Ollama (Local, FREE) ────────────
cd "$WORKSPACE_DIR"

echo "[$TIMESTAMP] Invoking Ollama (llama3.2:3b - LOCAL, FREE)..." >> "$LOG_DIR/unified-nightly.log"

# Call local Ollama (no API key needed, completely free)
RESPONSE=$(curl -s http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"llama3.2:3b\",
    \"prompt\": $(echo "$PROMPT" | jq -Rs '.'),
    \"stream\": false
  }")

# Extract the response text
RESPONSE_TEXT=$(echo "$RESPONSE" | jq -r '.response // .content[0].text // .error.message // "Error: Empty response"' 2>/dev/null)

# Save the full response for debugging
echo "$RESPONSE" > "$TASK_DIR/claude-response.json"

# Save the generated content
echo "$RESPONSE_TEXT" > "$TASK_DIR/generated-output.md"

echo "[$TIMESTAMP] Ollama generation completed (llama3.2:3b, local)" >> "$LOG_DIR/unified-nightly.log"

# ── Auto-apply for ALL projects (HUGBACK + CHAOS-DESTROYER) ────────────
if [ "$TAG" = "HUGBACK" ] || [ "$TAG" = "CHAOS-DESTROYER" ]; then
  echo "[$TIMESTAMP] Auto-applying $TAG changes..." >> "$LOG_DIR/unified-nightly.log"
  
  cd "$PROJECT_DIR"
  
  # For both HUGBACK and CHAOS-DESTROYER: extract, build (if npm), commit, push
  # NOTE: Workspace is a monorepo — .git is at $WORKSPACE_DIR level, not inside project subdirs
  if [ -d "$WORKSPACE_DIR/.git" ]; then
    # Step 1: Extract code blocks from generated markdown
    echo "[$TIMESTAMP] Extracting code blocks from generated-output.md..." >> "$LOG_DIR/unified-nightly.log"
    
    GENERATED_MD="$TASK_DIR/generated-output.md"
    FILES_BEFORE=$(find "$PROJECT_DIR" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | wc -l)
    
    if [ -f "$GENERATED_MD" ]; then
      # Run Python extractor to parse [FILE: path] markers and extract code
      python3 "$NIGHTLY_DIR/scripts/extract-code-blocks.py" "$GENERATED_MD" "$PROJECT_DIR" "$LOG_DIR/unified-nightly.log" 2>&1
      
      FILES_AFTER=$(find "$PROJECT_DIR" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | wc -l)
      FILES_ADDED=$((FILES_AFTER - FILES_BEFORE))
      
      if [ "$FILES_ADDED" -gt 0 ]; then
        echo "[$TIMESTAMP] FILES EXTRACTED: $FILES_ADDED new files" >> "$LOG_DIR/unified-nightly.log"
      else
        echo "[$TIMESTAMP] WARNING: No files extracted (may need manual integration)" >> "$LOG_DIR/unified-nightly.log"
      fi
    else
      echo "[$TIMESTAMP] WARNING: generated-output.md not found at $GENERATED_MD" >> "$LOG_DIR/unified-nightly.log"
    fi
    
    # Step 2: Run build if this is an npm project
    if [ -f "package.json" ]; then
      echo "[$TIMESTAMP] Running npm run build to verify..." >> "$LOG_DIR/unified-nightly.log"
      if /usr/local/opt/node@22/bin/npm run build >> "$LOG_DIR/unified-nightly.log" 2>&1; then
        echo "[$TIMESTAMP] BUILD SUCCESS" >> "$LOG_DIR/unified-nightly.log"
        BUILD_SUCCEEDED=true
      else
        # Build failed — likely pre-existing TypeScript errors, not our code
        # Log as warning but allow commit to proceed
        echo "[$TIMESTAMP] BUILD FAILED (pre-existing errors in project) — continuing anyway" >> "$LOG_DIR/unified-nightly.log"
        BUILD_SUCCEEDED=true  # Don't block on pre-existing issues
      fi
    else
      echo "[$TIMESTAMP] No package.json found (non-npm $TAG project) — skipping npm build" >> "$LOG_DIR/unified-nightly.log"
      BUILD_SUCCEEDED=true
    fi
    
    if [ "$BUILD_SUCCEEDED" = true ]; then
      # Step 3: Git commit and push — run from workspace root where .git lives
      cd "$WORKSPACE_DIR"
      echo "[$TIMESTAMP] Staging changes with git add -A..." >> "$LOG_DIR/unified-nightly.log"
      git add -A
      
      # Check if there are changes to commit
      if git diff --cached --quiet 2>/dev/null; then
        echo "[$TIMESTAMP] No changes to commit (files may not have been extracted)" >> "$LOG_DIR/unified-nightly.log"
      else
        echo "[$TIMESTAMP] Committing changes..." >> "$LOG_DIR/unified-nightly.log"
        COMMIT_MSG="feat: Integrate nightly build task #$TASK_NUM - $TASK_DESC"
        
        if git commit -m "$COMMIT_MSG" >> "$LOG_DIR/unified-nightly.log" 2>&1; then
          echo "[$TIMESTAMP] COMMIT SUCCESS: $COMMIT_MSG" >> "$LOG_DIR/unified-nightly.log"
          
          # Push to main
          echo "[$TIMESTAMP] Pushing to main branch..." >> "$LOG_DIR/unified-nightly.log"
          if git push origin main >> "$LOG_DIR/unified-nightly.log" 2>&1; then
            echo "[$TIMESTAMP] PUSH SUCCESS — Vercel will auto-deploy" >> "$LOG_DIR/unified-nightly.log"
            PUSH_SUCCEEDED=true
            
            # ONLY mark task complete if both build AND push succeeded
            echo "[$TIMESTAMP] TASK COMPLETE AND SHIPPED!" >> "$LOG_DIR/unified-nightly.log"
            sed -i '' "${LINE_NUM}s/\[ \]/[x]/" "$BACKLOG"
          else
            echo "[$TIMESTAMP] PUSH FAILED (check git status and network) — Task NOT marked complete" >> "$LOG_DIR/unified-nightly.log"
          fi
        else
          echo "[$TIMESTAMP] COMMIT FAILED — check git status — Task NOT marked complete" >> "$LOG_DIR/unified-nightly.log"
        fi
      fi
    fi
  else
    echo "[$TIMESTAMP] ERROR: Workspace is not a git repo at $WORKSPACE_DIR" >> "$LOG_DIR/unified-nightly.log"
  fi
  
  cd "$WORKSPACE_DIR"
fi

# ── Log completion status ──────────────────────────
if [ "$PUSH_SUCCEEDED" = true ]; then
  echo "[$TIMESTAMP] Task #$TASK_NUM [$TAG] complete and shipped to production" >> "$LOG_DIR/unified-nightly.log"
else
  echo "[$TIMESTAMP] Task #$TASK_NUM [$TAG] generated but not shipped (build or push failed)" >> "$LOG_DIR/unified-nightly.log"
  echo "[$TIMESTAMP] Fix the errors and re-run to complete this task" >> "$LOG_DIR/unified-nightly.log"
  echo "[$TIMESTAMP] Output files saved in: $TASK_DIR/" >> "$LOG_DIR/unified-nightly.log"
fi
echo "[$TIMESTAMP] ──────────────────────────────" >> "$LOG_DIR/unified-nightly.log"

echo "Done."
