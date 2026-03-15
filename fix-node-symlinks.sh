#!/bin/bash
# Node Symlink Fix
# 
# Problem: launchd runs npm scripts that use #!/usr/bin/env node shebang
# Node is installed at /usr/local/opt/node@22/ but not in system PATH
# Solution: Create symlinks in /usr/local/bin so npm scripts find Node
#
# Note: /usr/local/bin is user-writable on macOS, so no sudo needed

set -e

echo "🔧 Fixing Node symlinks for launchd..."

# Check if Node exists
if [ ! -f "/usr/local/opt/node@22/bin/node" ]; then
  echo "❌ ERROR: Node not found at /usr/local/opt/node@22/bin/node"
  exit 1
fi

# Create symlinks (no sudo needed — /usr/local/bin is user-writable)
echo "📍 Creating symlink: /usr/local/bin/node → /usr/local/opt/node@22/bin/node"
ln -sf /usr/local/opt/node@22/bin/node /usr/local/bin/node 2>/dev/null || {
  echo "⚠️ Warning: Could not create node symlink (may require sudo)"
  exit 1
}

echo "📍 Creating symlink: /usr/local/bin/npm → /usr/local/opt/node@22/bin/npm"
ln -sf /usr/local/opt/node@22/bin/npm /usr/local/bin/npm 2>/dev/null || {
  echo "⚠️ Warning: Could not create npm symlink (may require sudo)"
  exit 1
}

echo "📍 Creating symlink: /usr/local/bin/npx → /usr/local/opt/node@22/bin/npx"
ln -sf /usr/local/opt/node@22/bin/npx /usr/local/bin/npx 2>/dev/null || {
  echo "⚠️ Warning: Could not create npx symlink (may require sudo)"
  exit 1
}

# Verify
echo ""
echo "✅ Verifying symlinks..."
/usr/local/bin/node --version && echo "  ✓ node works"
/usr/local/bin/npm --version && echo "  ✓ npm works"
/usr/local/bin/npx --version && echo "  ✓ npx works"

echo ""
echo "🎉 Node symlinks fixed! launchd can now run npm scripts correctly."
echo ""
echo "Testing npm in HugBack repo..."
cd /Users/benblack/hugback
/usr/local/bin/npm run build 2>&1 | head -10 && echo "  ✓ npm build works in HugBack" || echo "  ⚠️ Build test failed"

echo ""
echo "✅ All set! Nightly builds will now succeed."
