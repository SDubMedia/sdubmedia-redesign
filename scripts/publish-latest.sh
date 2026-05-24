#!/bin/bash
# Publish the latest approved draft to the live site.
# Run via Hermes (reply PUBLISH in Telegram) or directly from terminal.
# Usage: ./scripts/publish-latest.sh

set -euo pipefail
cd "$(dirname "$0")/.."

# Find the most recent draft
DRAFT=$(ls -t content/drafts/*.md 2>/dev/null | head -1 || true)

if [ -z "$DRAFT" ]; then
  echo "ERROR: No drafts found in content/drafts/"
  exit 1
fi

FILENAME=$(basename "$DRAFT")
DEST="src/content/blog/$FILENAME"

echo "Publishing: $FILENAME"

# Flip draft flag to false. Tolerant of spacing variations:
# matches "draft:true", "draft: true", "draft:  true ", any case.
sed -E 's/^draft:[[:space:]]*true[[:space:]]*$/draft: false/I' "$DRAFT" > "$DEST"

# Safety check: confirm the published copy is not still marked draft: true
if grep -qiE '^draft:[[:space:]]*true' "$DEST"; then
  echo "ERROR: published copy still has draft: true — aborting before it goes live invisible."
  rm -f "$DEST"
  exit 1
fi

# Archive the original draft
mkdir -p content/published
mv "$DRAFT" "content/published/$FILENAME"
echo "Moved to src/content/blog/ and archived in content/published/"

# Verify it builds before pushing — never push a broken site
echo "Verifying build..."
if ! npm run build >/tmp/sdub-publish-build.log 2>&1; then
  echo "ERROR: build failed. Not pushing. See /tmp/sdub-publish-build.log"
  tail -20 /tmp/sdub-publish-build.log
  exit 1
fi
echo "Build OK."

# Commit everything Hermes touched (new post, archive, keyword-tracker updates).
# .gitignore excludes node_modules/dist/.astro/.vercel, so -A is safe here.
git add -A
git commit -m "Publish: $FILENAME

Auto-published via Hermes approval workflow.
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push

echo "Pushed to GitHub — Vercel is deploying now. Live in ~30 seconds."
