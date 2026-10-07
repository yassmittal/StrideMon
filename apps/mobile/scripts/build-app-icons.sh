#!/usr/bin/env bash
# Draws the app icon, Android adaptive layers and splash image from the StrideMon mark: the same
# line Sneaker as the website's favicon (website/src/app/icon.svg) and `BrandMark` in the app.
# Run it after changing the mark, from anywhere: apps/mobile/scripts/build-app-icons.sh
# Needs rsvg-convert (`brew install librsvg`). The PNGs it writes are committed.
set -euo pipefail

assets_dir="$(cd "$(dirname "$0")/../assets" && pwd)"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

dark_panel='#141515'
lime='#C1FF00'
white='#FFFFFF'

# The mark on a 64-unit grid: sole, upper, and the lime stripe.
draw_mark() {
  local outline_color="$1" stripe_color="$2"
  cat <<SVG
<path d="M13 43h30c5 0 9-1 10-3 1-1 0-2-1-2L26 37c-5 0-9-1-12-1-1 3-1 6-1 7Z" fill="none" stroke="$outline_color" stroke-width="3" stroke-linejoin="round"/>
<path d="M14 36c-2-5-2-10-1-15 4 2 8 3 11 3l3-6 15 10c7 2 10 6 11 10" fill="none" stroke="$outline_color" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15 32c8 1 16-2 22-6" fill="none" stroke="$stripe_color" stroke-width="3.5" stroke-linecap="round"/>
SVG
}

write_svg() {
  local file_name="$1" body="$2"
  printf '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">%s</svg>\n' "$body" >"$work_dir/$file_name"
}

# Android adaptive icons crop to a 66 of 108 dp safe zone, so the mark shrinks to half the canvas,
# centred (its own centre is at 33, 30.5).
adaptive_transform='translate(32 32) scale(0.75) translate(-33 -30.5)'

# iOS and the store icon: full bleed, the system rounds the corners.
write_svg icon.svg "<rect width=\"64\" height=\"64\" fill=\"$dark_panel\"/>$(draw_mark "$white" "$lime")"
write_svg android-icon-foreground.svg "<g transform=\"$adaptive_transform\">$(draw_mark "$white" "$lime")</g>"
write_svg android-icon-background.svg "<rect width=\"64\" height=\"64\" fill=\"$dark_panel\"/>"
# Android 13 themed icons tint this one colour, so the stripe joins the outline.
write_svg android-icon-monochrome.svg "<g transform=\"$adaptive_transform\">$(draw_mark "$white" "$white")</g>"
# The rounded tile on the light splash. Android 12+ masks the splash image to a circle two thirds
# of its width, so the tile stays at about half the canvas to keep its corners.
write_svg splash-icon.svg "<g transform=\"translate(32 32) scale(0.52) translate(-32 -32)\"><rect width=\"64\" height=\"64\" rx=\"14\" fill=\"$dark_panel\"/>$(draw_mark "$white" "$lime")</g>"
write_svg favicon.svg "<rect width=\"64\" height=\"64\" rx=\"14\" fill=\"$dark_panel\"/>$(draw_mark "$white" "$lime")"

render() {
  local name="$1" size="$2"
  rsvg-convert --width "$size" --height "$size" "$work_dir/$name.svg" --output "$assets_dir/$name.png"
  echo "wrote assets/$name.png (${size}px)"
}

render icon 1024
render android-icon-foreground 512
render android-icon-background 512
render android-icon-monochrome 432
render splash-icon 1024
render favicon 48
