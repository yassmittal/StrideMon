#!/usr/bin/env bash
# Renders the Product Hunt gallery pages to PNGs in social/media/product-hunt/ with headless Chrome,
# and the 240 × 240 thumbnail from the app icon. Each page sets its own size with
# <meta name="canvas" content="1270x760">.
# Usage (from the repo root):
#   bash social/product-hunt/design/render.sh
set -euo pipefail

chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
output_directory="social/media/product-hunt"
mkdir -p "$output_directory"

for page_path in social/product-hunt/design/gallery-*.html; do
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

# Product Hunt's thumbnail: square, 240 × 240 recommended, under 3 MB.
sips -z 240 240 apps/mobile/assets/icon.png --out "$output_directory/thumbnail-240.png" >/dev/null
echo "$output_directory/thumbnail-240.png (240x240)"
