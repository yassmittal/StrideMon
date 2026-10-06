"""Checks the run-screen rebuild against screenshot 03.

Run from launch-video/ after `bunx remotion still RunScreenCheck out/checks/run-screen.png`:
`python3 scripts/check-run-screen-overlay.py`. Needs Pillow and NumPy.

Prints each element's ink band (rows and columns) in both images and the difference, and
writes out/checks/run-screen-overlay.png, a 50/50 blend. The brief allows a few pixels.
"""

from pathlib import Path

import numpy as np
from PIL import Image

SCREENSHOT_PATH = Path("../website/public/screenshots/03-active-run.png")
REBUILD_PATH = Path("out/checks/run-screen.png")
OVERLAY_PATH = Path("out/checks/run-screen-overlay.png")
# The screenshot still shows the dev-client gear at the top right; it isn't app UI.
GEAR_LEFT_PIXELS = 880
INK_THRESHOLD = 40


def find_ink_bands(image: np.ndarray) -> list[tuple[int, int, int, int]]:
    luminance = image.mean(axis=2)
    luminance[:300, GEAR_LEFT_PIXELS:] = 0
    ink = luminance > INK_THRESHOLD
    rows_with_ink = ink.any(axis=1)
    bands = []
    band_start = None
    for row_index, has_ink in enumerate(rows_with_ink):
        if has_ink and band_start is None:
            band_start = row_index
        if not has_ink and band_start is not None:
            columns = np.where(ink[band_start:row_index].any(axis=0))[0]
            bands.append((band_start, row_index - 1, int(columns.min()), int(columns.max())))
            band_start = None
    return bands


def main() -> None:
    screenshot = np.asarray(Image.open(SCREENSHOT_PATH).convert("RGB")).astype(float)
    rebuild = np.asarray(Image.open(REBUILD_PATH).convert("RGB")).astype(float)
    screenshot_bands = find_ink_bands(screenshot.copy())
    rebuild_bands = find_ink_bands(rebuild.copy())
    print(f"{'screenshot rows':>18} {'rebuild rows':>14}   top Δ  bottom Δ  left Δ  right Δ")
    for screenshot_band, rebuild_band in zip(screenshot_bands, rebuild_bands):
        deltas = [rebuild_band[index] - screenshot_band[index] for index in range(4)]
        print(
            f"{screenshot_band[0]:>8}-{screenshot_band[1]:<8} {rebuild_band[0]:>6}-{rebuild_band[1]:<6}"
            f"  {deltas[0]:>6} {deltas[1]:>8} {deltas[2]:>7} {deltas[3]:>7}"
        )
    if len(screenshot_bands) != len(rebuild_bands):
        print(f"band count differs: screenshot {len(screenshot_bands)}, rebuild {len(rebuild_bands)}")
    overlay = ((screenshot + rebuild) / 2).astype(np.uint8)
    Image.fromarray(overlay).save(OVERLAY_PATH)
    print(f"wrote {OVERLAY_PATH}")


if __name__ == "__main__":
    main()
