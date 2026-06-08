#!/usr/bin/env python3
"""
Extract Code Blocks from Markdown with FILE directives

Parses markdown for [FILE: path] markers and extracts code blocks
Writes files to the project directory with proper paths
"""

import sys
import re
import os
from pathlib import Path

def extract_code_blocks(markdown_file, output_base_dir, log_file=None):
    """Extract code blocks from markdown with FILE directives (or fallback to inferred paths)"""
    
    if not os.path.isfile(markdown_file):
        print(f"Error: File not found: {markdown_file}")
        return False
    
    try:
        with open(markdown_file, 'r') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return False
    
    log = lambda msg: (print(msg), open(log_file, 'a').write(f"{msg}\n")) if log_file else print(msg)
    
    # ===== METHOD 1: [FILE: path] markers (new format) =====
    # Split by [FILE: marker to process each file section
    file_sections = re.split(r'\[FILE:\s*([^\]]+)\]', content)
    
    files_written = []
    
    # file_sections will be: [preamble, filename1, content1, filename2, content2, ...]
    # Skip the first element (preamble)
    if len(file_sections) > 1:
        log(f"[extract-code-blocks.py] Found {(len(file_sections) - 1) // 2} [FILE:] markers")
        
        for i in range(1, len(file_sections), 2):
            if i + 1 >= len(file_sections):
                break
            
            file_path_rel = file_sections[i].strip()
            section_content = file_sections[i + 1]
            
            # Find the first ``` ... ``` block in this section
            code_match = re.search(r'```[^\n]*\n(.*?)\n```', section_content, re.DOTALL)
            
            if not code_match:
                log(f"[extract-code-blocks.py] WARNING: No code block found after {file_path_rel}")
                continue
            
            code_content = code_match.group(1).rstrip()
            
            # Write file
            full_path = os.path.join(output_base_dir, file_path_rel)
            dir_path = os.path.dirname(full_path)
            
            try:
                os.makedirs(dir_path, exist_ok=True)
                with open(full_path, 'w') as f:
                    f.write(code_content)
                files_written.append(full_path)
                log(f"[extract-code-blocks.py] ✅ Wrote {full_path}")
            except Exception as e:
                log(f"[extract-code-blocks.py] ERROR writing {full_path}: {e}")
    
    # ===== METHOD 2: Fallback - infer paths from code comments =====
    # For code blocks that start with // File: src/...
    if len(files_written) == 0:
        log(f"[extract-code-blocks.py] No [FILE:] markers found. Trying fallback extraction...")
        
        # Pattern: // File: path.js or // path/filename.js at start of code block
        fallback_pattern = r'```(?:jsx?|tsx?|sql|css|html)?\n\s*(?://|#|--)\s*[Ff]ile:\s*([^\n]+)\n(.*?)```'
        
        for match in re.finditer(fallback_pattern, content, re.DOTALL):
            file_path_rel = match.group(1).strip()
            code_content = match.group(2).rstrip()
            
            full_path = os.path.join(output_base_dir, file_path_rel)
            dir_path = os.path.dirname(full_path)
            
            try:
                os.makedirs(dir_path, exist_ok=True)
                with open(full_path, 'w') as f:
                    f.write(code_content)
                files_written.append(full_path)
                log(f"[extract-code-blocks.py] ✅ (fallback) Wrote {full_path}")
            except Exception as e:
                log(f"[extract-code-blocks.py] ERROR writing {full_path}: {e}")
        
        # Also try: // components/Dashboard.js (without "File:")
        bare_comment_pattern = r'```(?:jsx?|tsx?|javascript|sql|css|html)?\n\s*//\s*([\w/-]+\.jsx?)\n(.*?)```'
        
        for match in re.finditer(bare_comment_pattern, content, re.DOTALL):
            file_path_rel = match.group(1).strip()
            code_content = match.group(2).rstrip()
            
            if len(code_content) > 50 and file_path_rel:  # Only save meaningful files
                # Smart path mapping: redirect bare React files to src/components/
                is_react = any(x in code_content for x in ['from \'react\'', 'from "react"', 'import React', 'export default'])
                
                # If it's a React file without 'src/' prefix, add it
                if is_react and not file_path_rel.startswith('src/'):
                    file_path_rel = 'src/' + file_path_rel
                
                full_path = os.path.join(output_base_dir, file_path_rel)
                dir_path = os.path.dirname(full_path)
                
                try:
                    os.makedirs(dir_path, exist_ok=True)
                    with open(full_path, 'w') as f:
                        f.write(code_content)
                    files_written.append(full_path)
                    log(f"[extract-code-blocks.py] ✅ (bare-comment) Wrote {full_path}")
                except Exception as e:
                    log(f"[extract-code-blocks.py] ERROR writing {full_path}: {e}")
    
    # ===== METHOD 3: Pattern-based extraction for React/SQL/structured code =====
    # Detect and extract based on file naming patterns in headers and structure
    if len(files_written) == 0:
        log(f"[extract-code-blocks.py] Trying pattern-based extraction...")
        
        # Pattern: ### filename.jsx OR **filename** followed by ``` block
        # Also handles: ### filename (no backticks)
        pattern_pattern = r'(?:###\s+[`"]([\w/-]+\.(?:js|jsx|ts|tsx|sql|css|html)[`"])\s*\n|###\s+([\w/-]+\.(?:js|jsx|ts|tsx|sql|css|html))\s*\n|\*\*([\w/-]+\.(?:js|jsx|ts|tsx|sql|css|html))\*\*\s*\n)(?:```(?:jsx?|tsx?|sql|css|html)?\n)?(.*?)(?=```\n\n?(?:###|\*\*|$))'
        
        for match in re.finditer(pattern_pattern, content, re.DOTALL):
            file_path_rel = (match.group(1) or match.group(2) or match.group(3) or '').strip()
            if not file_path_rel:
                continue
            code_content = match.group(4).rstrip()
            
            if len(code_content) > 50:  # Only save meaningful files
                # Smart path mapping: redirect bare React files to src/components/
                # (chaos-destroyer uses TypeScript + src/ structure)
                is_react = any(x in code_content for x in ['from \'react\'', 'from "react"', 'import React', 'export default'])
                is_css = file_path_rel.endswith('.css')
                
                # If filename is bare (no dir prefix) and it's a React/CSS file, map to src/
                if is_react and '/' not in file_path_rel and not file_path_rel.startswith('src/'):
                    file_path_rel = 'src/components/' + file_path_rel
                elif is_css and '/' not in file_path_rel and not file_path_rel.startswith('src/'):
                    file_path_rel = 'src/components/' + file_path_rel
                
                full_path = os.path.join(output_base_dir, file_path_rel)
                dir_path = os.path.dirname(full_path)
                
                try:
                    os.makedirs(dir_path, exist_ok=True)
                    with open(full_path, 'w') as f:
                        f.write(code_content)
                    files_written.append(full_path)
                    log(f"[extract-code-blocks.py] ✅ (pattern) Wrote {full_path}")
                except Exception as e:
                    log(f"[extract-code-blocks.py] ERROR writing {full_path}: {e}")
    
    log(f"[extract-code-blocks.py] Extraction complete. {len(files_written)} files written\n")
    return len(files_written) > 0

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: extract-code-blocks.py <markdown_file> <output_base_dir> [log_file]")
        sys.exit(1)
    
    markdown_file = sys.argv[1]
    output_dir = sys.argv[2]
    log_file = sys.argv[3] if len(sys.argv) > 3 else None
    
    success = extract_code_blocks(markdown_file, output_dir, log_file)
    sys.exit(0 if success else 1)
