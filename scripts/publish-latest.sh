#!/bin/bash
# Publish the latest approved draft to the live site.
# Run via: hermes or directly from terminal.
# Usage: ./scripts/publish-latest.sh

set -e
cd "$(dirname "$0")/.."

# Find the most recent draft
DRAFT=$(ls -t content/drafts/*.md 2>/dev/null | head -1)

if [ -z "$DRAFT" ]; then
  echo "No drafts found in content/drafts/"
  exit 1
fi

FILENAME=$(basename "$DRAFT")
DEST="src/content/blog/$FILENAME"

echo "Publishing: $FILENAME"

# Remove 'draft: true' line and set to false
sed 's/^draft: true$/draft: false/' "$DRAFT" > "$DEST"

# Move draft to published archive
mkdir -p content/published
mv "$DRAFT" "content/published/$FILENAME"

echo "Moved to src/content/blog/ and content/published/"

# Git commit and push — Vercel auto-deploys on push to main
git add "$DEST" "content/published/$FILENAME" "research/keywords/quick-wins.md" "research/keywords/target-keywords.md"
git commit -m "Publish: $FILENAME

Auto-published via Hermes approval workflow.
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push

echo "Pushed to GitHub — Vercel is deploying now. Live in ~30 seconds."
