"""The Pass chat film's handwriting: the script face's own outline of the written word, and the
widths of the Satoshi words it sits between, so the film can frame the line exactly.

Writes src/pass-chat/handwriting-glyphs.ts (generated: never edit it). Run from launch-video/:

    uv run --no-project --with fonttools==4.60.1 --with brotli==1.1.0 --with uharfbuzz==0.51.1 \
        python scripts/build-pass-chat-handwriting.py

It downloads the face's Latin file from Google Fonts (the same file @remotion/google-fonts loads),
shapes the word with HarfBuzz (so kerning matches the browser), and writes each glyph's outline as
SVG path data in one shared frame: 1 unit = 1/1000 em, x from the word's start, y down from the
baseline (y 0). src/pass-chat/handwriting.ts draws the pen's centrelines over it; the film fills
this outline through a mask made of those strokes, so the ink lands along the pen's path in exactly
the font's shape.
"""

import io
import json
import urllib.request

import uharfbuzz
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

# Knewave by Tyler Finck, SIL Open Font License 1.1 (CREDITS.md). The latin subset that
# @remotion/google-fonts' Knewave loads.
FONT_URL = "https://fonts.gstatic.com/s/knewave/v15/sykz-yx0lLcxQaSIhS23-w.woff2"
FONT_FAMILY = "Knewave"
WORD = "isn’t"
OUTPUT_FILE = "src/pass-chat/handwriting-glyphs.ts"
# The line's other words, set in the app's own Satoshi file, as the film loads it (fonts.ts).
SATOSHI_FILE = "../apps/mobile/assets/fonts/Satoshi-Regular.ttf"
SATOSHI_WORDS = {"before": "This", "space": " ", "after": "a JPEG."}


def main() -> None:
    font_bytes = read_font_bytes()
    font = TTFont(io.BytesIO(font_bytes))
    units_per_em = font["head"].unitsPerEm
    to_milli_em = 1000 / units_per_em
    glyph_set = font.getGlyphSet()

    shaped_face = uharfbuzz.Face(font_bytes_as_sfnt(font))
    shaped_font = uharfbuzz.Font(shaped_face)
    buffer = uharfbuzz.Buffer()
    buffer.add_str(WORD)
    buffer.guess_segment_properties()
    uharfbuzz.shape(shaped_font, buffer, {"kern": True, "liga": True})

    glyph_order = font.getGlyphOrder()
    glyphs = []
    pen_x = 0
    for info, position in zip(buffer.glyph_infos, buffer.glyph_positions):
        glyph_name = glyph_order[info.codepoint]
        origin_x = (pen_x + position.x_offset) * to_milli_em
        origin_y = -position.y_offset * to_milli_em
        # Font units are y up; the film's frame is y down from the baseline.
        transform = (to_milli_em, 0, 0, -to_milli_em, origin_x, origin_y)
        svg_pen = SVGPathPen(glyph_set, ntos=lambda value: f"{value:.1f}".rstrip("0").rstrip("."))
        glyph_set[glyph_name].draw(TransformPen(svg_pen, transform))
        bounds_pen = BoundsPen(glyph_set)
        glyph_set[glyph_name].draw(TransformPen(bounds_pen, transform))
        left, top, right, bottom = bounds_pen.bounds
        glyphs.append(
            {
                "character": WORD[info.cluster],
                "glyphName": glyph_name,
                "originX": round(origin_x, 1),
                "advance": round(position.x_advance * to_milli_em, 1),
                "bounds": [round(left, 1), round(top, 1), round(right, 1), round(bottom, 1)],
                "pathData": svg_pen.getCommands(),
            }
        )
        pen_x += position.x_advance

    word_advance = round(pen_x * to_milli_em, 1)
    satoshi_advances = read_satoshi_advances()
    write_glyphs_file(glyphs, word_advance, satoshi_advances)
    print("Satoshi advances (milli-em):", satoshi_advances)
    print(f"Wrote {OUTPUT_FILE}: {len(glyphs)} glyphs, advance {word_advance} milli-em")
    for glyph in glyphs:
        print(glyph["character"], glyph["glyphName"], glyph["originX"], glyph["bounds"])


def read_satoshi_advances() -> dict[str, float]:
    with open(SATOSHI_FILE, "rb") as font_file:
        font_bytes = font_file.read()
    units_per_em = TTFont(io.BytesIO(font_bytes))["head"].unitsPerEm
    shaped_font = uharfbuzz.Font(uharfbuzz.Face(font_bytes))
    advances = {}
    for key, text in SATOSHI_WORDS.items():
        buffer = uharfbuzz.Buffer()
        buffer.add_str(text)
        buffer.guess_segment_properties()
        uharfbuzz.shape(shaped_font, buffer, {"kern": True})
        total = sum(position.x_advance for position in buffer.glyph_positions)
        advances[key] = round(total * 1000 / units_per_em, 1)
    return advances


def read_font_bytes() -> bytes:
    request = urllib.request.Request(FONT_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request) as response:
        woff2_bytes = response.read()
    font = TTFont(io.BytesIO(woff2_bytes))
    return font_bytes_as_sfnt(font)


def font_bytes_as_sfnt(font: TTFont) -> bytes:
    font.flavor = None
    output = io.BytesIO()
    font.save(output)
    return output.getvalue()


def write_glyphs_file(
    glyphs: list[dict], word_advance: float, satoshi_advances: dict[str, float]
) -> None:
    glyph_lines = ",\n".join(
        "  {\n"
        f"    character: {json.dumps(glyph['character'], ensure_ascii=False)},\n"
        f"    originX: {glyph['originX']},\n"
        f"    advance: {glyph['advance']},\n"
        f"    bounds: {json.dumps(glyph['bounds'])},\n"
        f"    pathData: {json.dumps(glyph['pathData'])},\n"
        "  }"
        for glyph in glyphs
    )
    source = f"""// GENERATED by scripts/build-pass-chat-handwriting.py from {FONT_FAMILY} ({FONT_URL}).
// Never edit by hand. The written word's glyph outlines in one frame: 1 unit = 1/1000 em, x from
// the word's start, y down from the baseline. Shaped with HarfBuzz, so the spacing is the browser's.

export const HANDWRITING_FONT_FAMILY = {json.dumps(FONT_FAMILY)}
export const HANDWRITTEN_WORD = {json.dumps(WORD, ensure_ascii=False)}
/** The word's advance width: where the next word's space starts. */
export const HANDWRITTEN_WORD_ADVANCE = {word_advance}

/** The Satoshi words round it, shaped from {SATOSHI_FILE}, in milli-em. */
export const twistLineSatoshiAdvances = {{
  before: {satoshi_advances["before"]},
  space: {satoshi_advances["space"]},
  after: {satoshi_advances["after"]},
}} as const

export type HandwritingGlyph = {{
  character: string
  originX: number
  advance: number
  /** [left, top, right, bottom] of the ink. */
  bounds: readonly [number, number, number, number]
  pathData: string
}}

export const handwritingGlyphs: readonly HandwritingGlyph[] = [
{glyph_lines},
]
"""
    with open(OUTPUT_FILE, "w", encoding="utf-8") as output:
        output.write(source)


if __name__ == "__main__":
    main()
