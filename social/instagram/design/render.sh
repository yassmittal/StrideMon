#!/usr/bin/env bash
# Renders Instagram design pages to PNGs in social/media/instagram/ with headless Chrome. Each page
# sets its own size with <meta name="canvas" content="1080x1350">.
# Usage (from the repo root):
#   bash social/instagram/design/render.sh social/instagram/design/*.html
set -euo pipefail

chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
output_directory="social/media/instagram"
mkdir -p "$output_directory"

for page_path in "$@"; do
  canvas_size="$(grep -o 'name="canvas" content="[0-9]*x[0-9]*"' "$page_path" | grep -o '[0-9]*x[0-9]*')"
  canvas_width="${canvas_size%x*}"
  canvas_height="${canvas_size#*x}"
  source_path="$(cd "$(dirname "$page_path")" && pwd)/$(basename "$page_path")"
  output_path="$output_directory/$(basename "$page_path" .html).png"

  "$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --allow-file-access-from-files --virtual-time-budget=5000 \
    --window-size="$canvas_width,$canvas_height" --screenshot="$output_path" \
    "file://$source_path" 2>/dev/null

  echo "$output_path ($canvas_size)"
done
