#!/usr/bin/env bash
# The Pass chat film's art and sky, into public/pass-chat/ (gitignored). Run from launch-video/:
# `bash scripts/copy-pass-chat-art.sh`. Needs bun and ffmpeg.
#
#   1. Every gallery card's shoe, cropped out of ../website/public/pass-art/cards/NNNN.svg (the
#      contract renderer's own output, unlaced, as /pass shows it). The crop keeps the card's shoe
#      group and its light ground ellipse byte for byte and only changes the root viewBox to the
#      shoe's own 1000 × 600 frame, so the card's frame, header, name rows and cross marks fall
#      outside it. Each card places its shoe with its own `translate(30 y) scale(0.94)`, which the
#      viewBox follows. The film leaves the ellipse out (components/PassShoe.tsx): in the sky,
#      the shoe has nothing to sit on.
#   2. The sky photo (CREDITS.md): Pixabay serves the original only through its page's Download
#      button, so download it by hand into public/pass-chat/source/ (the script says how), and the
#      script checks it and scales it to SKY_WIDTH for the film.
# Read only: nothing in website/ or packages/ changes. Never edit the copies: DESIGNS_FROZEN_ON.
set -euo pipefail

CARD_SOURCE_DIRECTORY=../website/public/pass-art/cards
OUTPUT_DIRECTORY=public/pass-chat
SOURCE_DIRECTORY=$OUTPUT_DIRECTORY/source

# "Sky Clouds Atmosphere" by elg21, Pixabay Content License (CREDITS.md). 5568 × 3712.
SKY_PAGE_URL=https://pixabay.com/photos/sky-clouds-atmosphere-weather-7158340/
SKY_SOURCE_FILE_NAME=elg21-sky-7158340.jpg
SKY_SOURCE_SHA256=b2f893a911dd0605a1e675363487249f38a722ef1799ede611e0dd828310de15
# 4K wide: the sky pans about 2% and the card shows a crop of it, so it never softens.
SKY_WIDTH=3840

mkdir -p "$OUTPUT_DIRECTORY/shoes" "$SOURCE_DIRECTORY"

bun --eval "
  const { readdir } = await import('node:fs/promises')
  const names = (await readdir('$CARD_SOURCE_DIRECTORY')).filter((name) => name.endsWith('.svg'))
  for (const name of names) {
    const card = await Bun.file('$CARD_SOURCE_DIRECTORY/' + name).text()
    const ellipse = card.match(/<ellipse [^>]*\/>/)?.[0]
    const groupStart = card.indexOf('<g transform=\"translate(')
    const placement = card.slice(groupStart).match(/^<g transform=\"translate\(([\d.]+) ([\d.]+)\) scale\(([\d.]+)\)\">/)
    if (ellipse === undefined || groupStart === -1 || placement === null) throw new Error('Unexpected card layout: ' + name)
    // The shoe group runs to its own closing tag: count the nested <g>s.
    let depth = 0
    let groupEnd = groupStart
    for (const tag of card.slice(groupStart).matchAll(/<\/?g[ >]/g)) {
      depth += tag[0].startsWith('</') ? -1 : 1
      if (depth === 0) { groupEnd = groupStart + (tag.index ?? 0) + '</g>'.length; break }
    }
    const [, left, top, scale] = placement.map(Number)
    const viewBox = [left, top, 1000 * scale, 600 * scale].map((value) => Number(value.toFixed(3))).join(' ')
    const shoe = '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"' + viewBox + '\">' + ellipse + card.slice(groupStart, groupEnd) + '</svg>'
    await Bun.write('$OUTPUT_DIRECTORY/shoes/' + name, shoe)
  }
  console.log('shoes cropped:', names.length)
"

SKY_SOURCE=$SOURCE_DIRECTORY/$SKY_SOURCE_FILE_NAME
if [ ! -s "$SKY_SOURCE" ]; then
  echo "Missing the sky photo. Open $SKY_PAGE_URL, press Download (the original size)," >&2
  echo "and save it as launch-video/$SKY_SOURCE, then run this script again." >&2
  exit 1
fi
echo "$SKY_SOURCE_SHA256  $SKY_SOURCE" | shasum -a 256 -c --quiet -
ffmpeg -nostdin -v error -y -i "$SKY_SOURCE" -vf "scale=$SKY_WIDTH:-2:flags=lanczos" -q:v 2 \
  "$OUTPUT_DIRECTORY/sky.jpg"
ls -1 "$OUTPUT_DIRECTORY"
