#!/bin/bash
# =============================================
# Extract Code Blocks from Markdown
# Parses generated-output.md and writes code to actual files
# =============================================

MARKDOWN_FILE="$1"
OUTPUT_DIR="$2"

if [ -z "$MARKDOWN_FILE" ] || [ -z "$OUTPUT_DIR" ]; then
  echo "Usage: extract-code-blocks.sh <markdown_file> <output_dir>"
  exit 1
fi

if [ ! -f "$MARKDOWN_FILE" ]; then
  echo "Error: File not found: $MARKDOWN_FILE"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Use awk to extract code blocks
awk -v output_dir="$OUTPUT_DIR" '
  /^```/ {
    if (in_block) {
      # Closing block
      in_block = 0
      close(current_file)
      print "[extracted] " current_file > "/dev/stderr"
    } else {
      # Opening block - extract language from fence (e.g., ```jsx)
      match($0, /^```([a-z]*)/, arr)
      lang = arr[1]
      
      # Determine file extension based on language
      if (lang == "jsx" || lang == "js") {
        ext = "js"
      } else if (lang == "tsx" || lang == "ts") {
        ext = "ts"
      } else if (lang == "sql") {
        ext = "sql"
      } else if (lang == "css") {
        ext = "css"
      } else if (lang == "json") {
        ext = "json"
      } else if (lang == "html") {
        ext = "html"
      } else {
        ext = "txt"
      }
      
      # Generate filename based on content hint or counter
      # For now, use a counter
      if (lang == "") {
        next
      }
      
      counter[ext]++
      current_file = output_dir "/" counter[ext] "." ext
      in_block = 1
    }
    next
  }
  
  in_block {
    print $0 >> current_file
  }
' "$MARKDOWN_FILE" 2>&1

echo "[extract-code-blocks.sh] Extraction complete. Files written to $OUTPUT_DIR"
