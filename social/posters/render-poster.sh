#!/usr/bin/env bash
# Renders a poster HTML file to a 1080 × 1350 PNG in social/media/ with headless Chrome.
# Usage (from the repo root): bash social/posters/render-poster.sh social/posters/<name>.html
set -euo pipefail

chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
source_path="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
output_path="social/media/$(basename "$1" .html).png"

"$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --allow-file-access-from-files --virtual-time-budget=3000 \
  --window-size=1080,1350 --screenshot="$output_path" "file://$source_path" 2>/dev/null

echo "$output_path"
