"""Checks the App tour film's rebuilt screens against the submission reel.

Run from launch-video/ (needs ffmpeg, Pillow and NumPy):

    for check in repairConfirming repairSucceeded; do
      bunx remotion still AppTourRebuild-$check out/checks/app-tour/$check.png
    done
    python3 scripts/check-app-tour-rebuilds.py

For each check it pulls the reel frame, finds every band of ink (text, icons, fills that differ from
the screen's background) inside the compared region in both images, and prints each band's rows and
columns with the differences. The brief allows ±3 px. It also writes a 50/50 overlay of the region
to out/checks/app-tour/<check>-overlay.png.

The reel's editor framed some clips a little differently (the Sneaker tab at 34.9–35.9 s is drawn
about 0.5% larger than the sheets at 40–42 s, and 49.0 s is stretched about 3.7% sideways). For
those checks the script first fits that clip's framing from the ink profiles (one zoom, or one
stretch per axis, plus an offset, for the whole frame) and prints it; every element must then sit
within ±3 px.
"""

import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

REEL_PATH = Path("../website/media-source/submission-reel.mp4")
CHECK_DIRECTORY = Path("out/checks/app-tour")
TOLERANCE_PIXELS = 3

# name: (reel second, (top, bottom, left, right) region compared, background RGB, ink threshold,
#        rows to leave out: the spinner's arc animates, and a faint line the encode softens,
#        the clip's framing to fit first: None, "uniform" (a zoom) or "stretch" (each axis on its own))
CHECKS = {
    # The card's art and energy bar, drawn over the reel's own Home frame (the rest is the frame).
    # The art's divider (white at 10%) is left out: the reel's encode softens it under the threshold.
    "homeDrawIn": (10.5, (140, 1100, 36, 684), (20, 21, 21), 60, [(540, 556)], None),
    # The sheet only: 40.50 s still has the app switch's rounded corners at the bottom edge.
    "repairConfirming": (40.5, (1030, 1515, 20, 700), (240, 241, 250), 60, [(1180, 1260)], None),
    # From under the handle: the close button's faint edge would split the header's band.
    "repairSucceeded": (41.2, (760, 1530, 20, 700), (240, 241, 250), 70, [], None),
    # Down to the Repair panel: at 34.9 s its cost is still loading (no chip, no rows).
    "sneakerTabTop": (34.9, (20, 1300, 0, 720), (240, 241, 250), 60, [], "uniform"),
    # Under the reel's top edge (its first rows are cut off by the clip's framing) to the tab bar.
    # Text only (60): the cost chips' faint edges cross a lower threshold in one image and not the other.
    # It stops above the scroll view's bottom edge, which is the screen's, not the clip's framing.
    "sneakerTabScrolled": (35.9, (12, 1395, 0, 720), (240, 241, 250), 60, [], "uniform"),
    # Only the Upgrade panel: the rest of 49.0 s is another wallet's Sneaker #1, in a session with
    # a wider window (its panels are 689 px wide, 667 everywhere else, with the same text). So it's
    # held to ±3 px on rows only; its columns are printed for information. The film never cuts
    # against this frame: it was the reference for the panel's layout.
    "upgradePanel": (49.0, (470, 1140, 0, 720), (240, 241, 250), 60, [], "rows"),
}


def read_reel_frame(seconds: float) -> np.ndarray:
    path = CHECK_DIRECTORY / f"reel-{seconds:.3f}.png"
    if not path.exists():
        subprocess.run(
            ["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(seconds), "-i", str(REEL_PATH),
             "-frames:v", "1", str(path)],
            check=True,
        )
    return np.asarray(Image.open(path).convert("RGB")).astype(int)


def find_ink_bands(image: np.ndarray, background: tuple[int, int, int], threshold: int):
    ink = np.abs(image - np.array(background)).sum(axis=2) > threshold
    bands = []
    band_start = None
    for row_index in range(ink.shape[0] + 1):
        has_ink = row_index < ink.shape[0] and ink[row_index].any()
        if has_ink and band_start is None:
            band_start = row_index
        if not has_ink and band_start is not None:
            columns = np.where(ink[band_start:row_index].any(axis=0))[0]
            bands.append((band_start, row_index - 1, int(columns.min()), int(columns.max())))
            band_start = None
    return bands


def ink_mask(image: np.ndarray, background, threshold: int) -> np.ndarray:
    return np.abs(image - np.array(background)).sum(axis=2) > threshold


def apply_framing(
    image: Image.Image, scale_x: float, scale_y: float, offset_x: float, offset_y: float, fill=(240, 241, 250)
) -> np.ndarray:
    """The image scaled about its centre and moved, as an editor's zoom, stretch and position would."""
    width, height = image.size
    centre_x, centre_y = width / 2, height / 2
    # PIL's affine maps output pixels back to input pixels.
    inverse = (
        1 / scale_x, 0, centre_x - (centre_x + offset_x) / scale_x,
        0, 1 / scale_y, centre_y - (centre_y + offset_y) / scale_y,
    )
    framed = image.transform(
        image.size, Image.Transform.AFFINE, inverse, resample=Image.Resampling.BICUBIC, fillcolor=fill
    )
    return np.asarray(framed.convert("RGB")).astype(int)


def fit_axis(rebuild_profile: np.ndarray, reel_profile: np.ndarray, first: int, last: int, scales):
    """The scale (about the frame's centre) and offset that best lay one ink profile on the other."""
    size = rebuild_profile.shape[0]
    centre = size / 2
    positions = np.arange(size)
    target = reel_profile[first:last]
    best = (-np.inf, 1.0, 0.0)
    for scale in scales:
        for offset in np.arange(-16, 16.5, 0.5):
            # Where each output pixel comes from in the rebuild.
            source = centre + (positions - centre - offset) / scale
            moved = np.interp(source, positions, rebuild_profile, left=0, right=0)[first:last]
            score = -np.abs(moved - target).sum()
            if score > best[0]:
                best = (score, float(scale), float(offset))
    return best[1], best[2]


def fit_framing(rebuild_image: Image.Image, reel_full: np.ndarray, region, background, threshold, mode):
    """The reel clip's framing: a uniform zoom (mode "uniform") or a separate stretch per axis."""
    top, bottom, left, right = region
    reel_ink = ink_mask(reel_full, background, threshold).astype(float)
    rebuild_ink = ink_mask(np.asarray(rebuild_image).astype(int), background, threshold).astype(float)
    # Profiles inside the compared region only.
    reel_rows = np.zeros(reel_ink.shape[0])
    reel_rows[top:bottom] = reel_ink[top:bottom, left:right].sum(axis=1)
    rebuild_rows = rebuild_ink[:, left:right].sum(axis=1)
    reel_columns = np.zeros(reel_ink.shape[1])
    reel_columns[left:right] = reel_ink[top:bottom, left:right].sum(axis=0)
    rebuild_columns = rebuild_ink[top:bottom].sum(axis=0)
    scales = np.arange(0.99, 1.06, 0.0025)
    scale_y, offset_y = fit_axis(rebuild_rows, reel_rows, top, bottom, scales)
    if mode == "uniform":
        scale_x = scale_y
        _, offset_x = fit_axis(rebuild_columns, reel_columns, left, right, [scale_y])
    else:
        scale_x, offset_x = fit_axis(rebuild_columns, reel_columns, left, right, scales)
    return scale_x, scale_y, offset_x, offset_y


def run_check(name: str) -> bool:
    seconds, (top, bottom, left, right), background, threshold, animated_rows, fit_mode = CHECKS[name]
    reel_full = read_reel_frame(seconds)
    reel = reel_full[top:bottom, left:right].copy()
    rebuild_path = CHECK_DIRECTORY / f"{name}.png"
    rebuild_image = Image.open(rebuild_path).convert("RGB")
    if fit_mode == "rows":
        rebuild_full = np.asarray(rebuild_image).astype(int)
    elif fit_mode is not None:
        scale_x, scale_y, offset_x, offset_y = fit_framing(
            rebuild_image, reel_full, (top, bottom, left, right), background, threshold, fit_mode
        )
        print(
            f"\n{name}: the reel clip's framing, fitted ({fit_mode}): scale x {scale_x:.4f} y {scale_y:.4f},"
            f" offset x {offset_x:+.1f} y {offset_y:+.1f}"
        )
        rebuild_full = apply_framing(rebuild_image, scale_x, scale_y, offset_x, offset_y)
    else:
        rebuild_full = np.asarray(rebuild_image).astype(int)
    rebuild = rebuild_full[top:bottom, left:right].copy()
    for first_row, last_row in animated_rows:
        for image in (reel, rebuild):
            image[first_row - top : last_row - top] = background
    reel_bands = find_ink_bands(reel, background, threshold)
    rebuild_bands = find_ink_bands(rebuild, background, threshold)
    print(f"\n{name} (reel {seconds} s, rows {top}–{bottom}, columns {left}–{right})")
    print(f"{'reel rows':>13} {'rebuild rows':>13}   top Δ  bottom Δ  left Δ  right Δ")
    worst = 0
    checked_sides = 2 if fit_mode == "rows" else 4
    for reel_band, rebuild_band in zip(reel_bands, rebuild_bands):
        deltas = [rebuild_band[index] - reel_band[index] for index in range(4)]
        band_worst = max(abs(delta) for delta in deltas[:checked_sides])
        worst = max(worst, band_worst)
        flag = "" if band_worst <= TOLERANCE_PIXELS else "  ✗"
        print(
            f"{reel_band[0] + top:>6}-{reel_band[1] + top:<6} {rebuild_band[0] + top:>6}-{rebuild_band[1] + top:<6}"
            f"  {deltas[0]:>6} {deltas[1]:>8} {deltas[2]:>7} {deltas[3]:>7}{flag}"
        )
    matched = len(reel_bands) == len(rebuild_bands)
    if not matched:
        print(f"band count differs: reel {len(reel_bands)}, rebuild {len(rebuild_bands)}")
    overlay = ((reel + rebuild) / 2).astype(np.uint8)
    Image.fromarray(overlay).save(CHECK_DIRECTORY / f"{name}-overlay.png")
    passed = matched and worst <= TOLERANCE_PIXELS
    print(f"worst {worst} px: {'pass' if passed else 'FAIL'}")
    return passed


def main() -> None:
    CHECK_DIRECTORY.mkdir(parents=True, exist_ok=True)
    names = sys.argv[1:] or list(CHECKS)
    results = [run_check(name) for name in names]
    sys.exit(0 if all(results) else 1)


if __name__ == "__main__":
    main()
