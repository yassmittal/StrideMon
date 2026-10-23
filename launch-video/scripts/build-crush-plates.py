"""The Crush film's clean plates and camera tracks, from the reference (../inspiration.mp4).

Run from launch-video/:

    uv run --no-project --python 3.11 --with onnxruntime --with opencv-python-headless \
      --with pillow --with numpy python scripts/build-crush-plates.py

`uv` builds a throwaway environment, so nothing is installed in the repo. It needs ffmpeg and curl.

The film keeps every shot of the reference and swaps its cup for a Sneaker (docs/crush-video-prompt.md).
For that, each shot needs the reference's own background without the cup, and the reference's own
camera motion:

1. Plates. One frame per shot is inpainted where the cup, the hands and the burnt-in titles are,
   with LaMa (big-lama, Apache 2.0, the ONNX export at huggingface.co/Carve/LaMa-ONNX, downloaded
   once into out/work/crush/). The model runs on a crop around the hole and only the hole is pasted
   back. Plates go to public/crush/plates/<shot>.png (gitignored).
2. Tracks. For every frame of a shot, the similarity transform (zoom, turn, shift) that takes the
   plate's frame onto that frame: ORB features matched frame to frame, with the moving cup, hands
   and on-screen text masked out, RANSAC-fitted and chained outward from the plate's frame. They're
   written to src/crush/tracks.ts (generated: never edit it by hand) as CSS matrices in the
   reference's 720 x 1280 pixels.

The hook's camera pan (frames 264 to 270) has a plate per frame instead: the camera turns too far
for one plate, so each frame is inpainted on its own and needs no track.
"""

import json
import subprocess
from pathlib import Path

import cv2
import numpy as np
import onnxruntime
from PIL import Image, ImageDraw, ImageFilter

REFERENCE_PATH = Path("../inspiration.mp4")
WORK_DIRECTORY = Path("out/work/crush")
FRAMES_DIRECTORY = WORK_DIRECTORY / "frames"
MODEL_PATH = WORK_DIRECTORY / "lama_fp32.onnx"
MODEL_URL = "https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx"
PLATES_DIRECTORY = Path("public/crush/plates")
TRACKS_PATH = Path("src/crush/tracks.ts")
MODEL_SIZE = 512
CROP_MARGIN_PIXELS = 140

# A region in the reference's pixels: ("rect", x0, y0, x1, y1), ("ellipse", cx, cy, rx, ry) or
# ("polygon", x, y, x, y, ...).
Region = tuple

# The plates: name -> (reference frame, the regions to inpaint). Read off grids drawn on each frame.
PLATES: dict[str, tuple[int, list[Region]]] = {
    # The hook's pan: the cup slides in from the right edge with the camera.
    "hookPan264": (264, [("rect", 676, 500, 720, 640)]),
    "hookPan265": (265, [("rect", 612, 505, 720, 885)]),
    "hookPan266": (266, [("rect", 530, 480, 720, 895)]),
    "hookPan267": (267, [("rect", 435, 495, 715, 905)]),
    "hookPan268": (268, [("rect", 340, 515, 615, 915)]),
    # The pan settles while the picture's right edge crops in (269 and 270).
    "hookPan269": (269, [("rect", 262, 500, 545, 940)]),
    "hookPan270": (270, [("rect", 212, 500, 495, 935)]),
    # The cup floating over the group, from frame 271 to the cut.
    "hookFloat": (272, [("rect", 180, 500, 470, 940)]),
    # The ledge: the cup is still above the frame on the shot's first frame.
    "ledge": (279, []),
    # The pearls: the clear cup and the ladle over it.
    "pearls": (
        294,
        [
            ("rect", 110, 440, 630, 1130),
            ("polygon", 150, 320, 330, 260, 690, 50, 720, 50, 720, 210, 430, 530, 150, 530),
        ],
    ),
    # The tea pour: the jug, the tilted cup, the hand and the cup's reflection.
    "pour": (316, [("rect", 0, 0, 310, 700), ("rect", 90, 170, 720, 1280)]),
    # The cream pour: the jug, the cup and the hand behind it.
    "cream": (331, [("rect", 0, 0, 390, 780), ("rect", 80, 590, 650, 1280), ("rect", 460, 410, 720, 870)]),
    # The topping: the tongs, the cup and the hand around it.
    "topping": (345, [("rect", 0, 450, 720, 1280), ("rect", 380, 0, 720, 1280)]),
    # Top down on the bench: the cup.
    "topDown": (360, [("rect", 0, 270, 720, 1280)]),
    # Held up to the sky: both hands, the straw and the cup.
    "sky": (
        372,
        [
            ("rect", 180, 0, 720, 340),
            ("rect", 170, 220, 490, 930),
            ("polygon", 400, 470, 720, 800, 720, 1110, 560, 1110, 380, 920),
            ("rect", 400, 440, 600, 720),
        ],
    ),
    # The grip close-up: the cup and the hand.
    "grip": (386, [("rect", 125, 0, 720, 1280)]),
    # The straw stirring, top down: the hand, the straw and the cup.
    "stir": (400, [("rect", 0, 0, 380, 1280), ("rect", 380, 330, 720, 1280)]),
    # The bench, from the tilt up the cup to the pair: both cups and the burnt-in title.
    "bench": (500, [("rect", 95, 478, 640, 882), ("rect", 160, 200, 565, 372)]),
}

# The top-down bench shots: the cup fills most of the frame, more than the model can invent, so
# their wood is spread and blurred outward instead (the Sneaker's close-up covers nearly all of it).
DIFFUSED_PLATES = {"topDown", "stir"}

# The tracked shots: name -> (first frame, end frame (not included), plate frame, regions left out
# of the tracking because they move on their own or stay put on screen).
TRACKED_SHOTS: dict[str, tuple[int, int, int, list[Region]]] = {
    "hookFloat": (271, 279, 272, [("rect", 0, 0, 720, 290), ("rect", 170, 490, 480, 950), ("rect", 0, 940, 720, 1280)]),
    "ledge": (279, 294, 279, [("rect", 150, 0, 720, 1000)]),
    "pearls": (294, 309, 294, [("rect", 110, 40, 720, 1130)]),
    "pour": (309, 324, 316, [("rect", 0, 0, 310, 700), ("rect", 280, 150, 720, 1280)]),
    "cream": (324, 339, 331, [("rect", 0, 0, 400, 800), ("rect", 80, 590, 650, 1280), ("rect", 450, 400, 720, 880)]),
    "topping": (339, 353, 345, [("rect", 0, 450, 720, 1280), ("rect", 380, 0, 720, 1280)]),
    "topDown": (353, 367, 360, []),
    "sky": (367, 380, 372, [("rect", 170, 0, 720, 1110)]),
    "grip": (380, 394, 386, [("rect", 120, 0, 720, 1280)]),
    "stir": (394, 408, 400, [("rect", 0, 0, 400, 800)]),
    "bench": (408, 520, 500, [("rect", 0, 180, 720, 380), ("rect", 0, 240, 430, 730)]),
}


def extract_frames() -> None:
    if FRAMES_DIRECTORY.exists() and any(FRAMES_DIRECTORY.iterdir()):
        return
    FRAMES_DIRECTORY.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "error", "-i", str(REFERENCE_PATH), "-start_number", "0",
         str(FRAMES_DIRECTORY / "%04d.png")],
        check=True,
    )


def download_model() -> None:
    if MODEL_PATH.exists():
        return
    subprocess.run(["curl", "-sSfL", "--retry", "3", "-o", str(MODEL_PATH), MODEL_URL], check=True)


def read_frame(frame: int) -> Image.Image:
    return Image.open(FRAMES_DIRECTORY / f"{frame:04d}.png").convert("RGB")


def draw_regions(size: tuple[int, int], regions: list[Region]) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    for kind, *values in regions:
        if kind == "rect":
            draw.rectangle(values, fill=255)
        elif kind == "ellipse":
            center_x, center_y, radius_x, radius_y = values
            draw.ellipse([center_x - radius_x, center_y - radius_y, center_x + radius_x, center_y + radius_y], fill=255)
        elif kind == "polygon":
            draw.polygon(list(zip(values[0::2], values[1::2])), fill=255)
    return mask


def inpaint(session: onnxruntime.InferenceSession, image: Image.Image, regions: list[Region]) -> Image.Image:
    if not regions:
        return image
    mask = draw_regions(image.size, regions).filter(ImageFilter.MaxFilter(9))
    rows, columns = np.nonzero(np.array(mask))
    left = max(0, columns.min() - CROP_MARGIN_PIXELS)
    top = max(0, rows.min() - CROP_MARGIN_PIXELS)
    right = min(image.width, columns.max() + CROP_MARGIN_PIXELS)
    bottom = min(image.height, rows.max() + CROP_MARGIN_PIXELS)
    crop, crop_mask = image.crop((left, top, right, bottom)), mask.crop((left, top, right, bottom))
    model_image = np.array(crop.resize((MODEL_SIZE, MODEL_SIZE), Image.LANCZOS), dtype=np.float32)
    model_mask = np.array(crop_mask.resize((MODEL_SIZE, MODEL_SIZE), Image.NEAREST), dtype=np.float32)
    result = session.run(
        None,
        {
            "image": model_image.transpose(2, 0, 1)[None] / 255,
            "mask": (model_mask > 127).astype(np.float32)[None, None],
        },
    )[0][0].transpose(1, 2, 0)
    if result.max() <= 1.5:
        result = result * 255
    filled = Image.fromarray(np.clip(result, 0, 255).astype(np.uint8)).resize(crop.size, Image.LANCZOS)
    plate = image.copy()
    plate.paste(Image.composite(filled, crop, crop_mask.filter(ImageFilter.GaussianBlur(4))), (left, top))
    return plate


def fill_by_diffusion(image: Image.Image, regions: list[Region]) -> Image.Image:
    """Fills a hole too big for the model (most of the frame) with the wood around it, spread and
    blurred outward: the Sneaker's close-up covers nearly all of it, and what shows reads as the
    reference's own out-of-focus bench. A little grain keeps it from looking flat."""
    hole = np.array(draw_regions(image.size, regions).filter(ImageFilter.MaxFilter(9))) > 0
    pixels = np.array(image, dtype=np.float32)
    known = (~hole).astype(np.float32)
    filled = pixels.copy()
    unfilled = hole.copy()
    for sigma in (6, 12, 24, 48, 96, 192, 384):
        weight = cv2.GaussianBlur(known, (0, 0), sigma)
        spread = cv2.GaussianBlur(pixels * known[..., None], (0, 0), sigma) / np.maximum(weight, 1e-6)[..., None]
        reached = unfilled & (weight > 1e-4)
        filled[reached] = spread[reached]
        unfilled &= ~reached
    filled[unfilled] = pixels[~hole].mean(axis=0)
    filled[hole] = cv2.GaussianBlur(filled, (0, 0), 30)[hole]
    grain = np.random.default_rng(7).normal(0, 3.0, filled.shape[:2])[..., None]
    filled[hole] = (filled + grain)[hole]
    return Image.fromarray(np.clip(filled, 0, 255).astype(np.uint8))


def build_plates() -> None:
    PLATES_DIRECTORY.mkdir(parents=True, exist_ok=True)
    session = onnxruntime.InferenceSession(str(MODEL_PATH), providers=["CPUExecutionProvider"])
    for name, (frame, regions) in PLATES.items():
        image = read_frame(frame)
        plate = fill_by_diffusion(image, regions) if name in DIFFUSED_PLATES else inpaint(session, image, regions)
        plate.save(PLATES_DIRECTORY / f"{name}.png")
        print(f"plate {name}: frame {frame}, {len(regions)} regions")


def estimate_step(orb, matcher, from_frame: int, to_frame: int, excluded: np.ndarray) -> np.ndarray:
    """The 2 x 3 similarity taking from_frame's pixels onto to_frame's, or identity if unsure."""
    images = [cv2.cvtColor(np.array(read_frame(frame)), cv2.COLOR_RGB2GRAY) for frame in (from_frame, to_frame)]
    feature_mask = np.where(excluded > 0, 0, 255).astype(np.uint8)
    (from_points, from_descriptors), (to_points, to_descriptors) = [
        orb.detectAndCompute(image, feature_mask) for image in images
    ]
    if from_descriptors is None or to_descriptors is None or len(from_points) < 12 or len(to_points) < 12:
        return np.array([[1, 0, 0], [0, 1, 0]], dtype=np.float64)
    matches = matcher.knnMatch(from_descriptors, to_descriptors, k=2)
    good = [pair[0] for pair in matches if len(pair) == 2 and pair[0].distance < 0.75 * pair[1].distance]
    if len(good) < 10:
        return np.array([[1, 0, 0], [0, 1, 0]], dtype=np.float64)
    source = np.float32([from_points[match.queryIdx].pt for match in good])
    target = np.float32([to_points[match.trainIdx].pt for match in good])
    transform, inliers = cv2.estimateAffinePartial2D(source, target, method=cv2.RANSAC, ransacReprojThreshold=2.5)
    if transform is None or inliers is None or inliers.sum() < 8:
        return np.array([[1, 0, 0], [0, 1, 0]], dtype=np.float64)
    return transform


def to_homogeneous(transform: np.ndarray) -> np.ndarray:
    return np.vstack([transform, [0, 0, 1]])


# Shots whose features mostly sit on what moves on its own (the pour, the foam, the ladle): their
# fits wander (up to 11° of turn that isn't in the reference), so they hold still and the film's
# own slow push-in (CrushFilm) keeps them alive.
STATIC_SHOTS = {"pearls", "pour", "topDown"}


def build_tracks() -> dict[str, list[list[float]]]:
    orb = cv2.ORB_create(nfeatures=3000)
    matcher = cv2.BFMatcher(cv2.NORM_HAMMING)
    tracks: dict[str, list[list[float]]] = {}
    for name, (start_frame, end_frame, plate_frame, regions) in TRACKED_SHOTS.items():
        if name in STATIC_SHOTS:
            tracks[name] = [[1, 0, 0, 1, 0, 0] for _ in range(start_frame, end_frame)]
            print(f"track {name}: frames {start_frame}-{end_frame - 1}, held still")
            continue
        excluded = np.array(draw_regions((720, 1280), regions))
        by_frame = {plate_frame: np.eye(3)}
        for frame in range(plate_frame + 1, end_frame):
            step = to_homogeneous(estimate_step(orb, matcher, frame - 1, frame, excluded))
            by_frame[frame] = step @ by_frame[frame - 1]
        for frame in range(plate_frame - 1, start_frame - 1, -1):
            step = to_homogeneous(estimate_step(orb, matcher, frame + 1, frame, excluded))
            by_frame[frame] = step @ by_frame[frame + 1]
        # CSS matrix(a, b, c, d, e, f): x' = a x + c y + e, y' = b x + d y + f.
        tracks[name] = [
            [round(float(value), 5) for value in (m[0, 0], m[1, 0], m[0, 1], m[1, 1], m[0, 2], m[1, 2])]
            for m in (by_frame[frame] for frame in range(start_frame, end_frame))
        ]
        scales = [np.hypot(m[0], m[1]) for m in tracks[name]]
        print(f"track {name}: frames {start_frame}-{end_frame - 1}, zoom {min(scales):.3f}-{max(scales):.3f}")
    return tracks


def write_tracks(tracks: dict[str, list[list[float]]]) -> None:
    lines = [
        "// GENERATED by scripts/build-crush-plates.py from ../inspiration.mp4. Do not edit by hand.",
        "// Per tracked shot, one CSS matrix per frame (from the shot's first frame) that takes the",
        "// shot's plate onto the reference's frame, in the reference's 720 x 1280 pixels.",
        "",
        "export type CrushTrackedShotName =",
        *[f"  | '{name}'" for name in tracks],
        "",
        "export type CssMatrix = readonly [number, number, number, number, number, number]",
        "",
        "export const crushTracks: Record<CrushTrackedShotName, readonly CssMatrix[]> = {",
    ]
    for name, matrices in tracks.items():
        lines.append(f"  {name}: [")
        lines.extend(f"    {json.dumps(matrix)}," for matrix in matrices)
        lines.append("  ],")
    lines.append("}")
    TRACKS_PATH.write_text("\n".join(lines) + "\n")


def main() -> None:
    WORK_DIRECTORY.mkdir(parents=True, exist_ok=True)
    extract_frames()
    download_model()
    build_plates()
    write_tracks(build_tracks())


if __name__ == "__main__":
    main()
