"""The Rain film's plates and tracks, from the reference (../keywordType.mp4).

Run from launch-video/:

    uv run --no-project --python 3.11 --with onnxruntime --with opencv-python-headless \
      --with pillow --with numpy python scripts/build-rain-plates.py

`uv` builds a throwaway environment, so nothing is installed in the repo. It needs ffmpeg, curl and
macOS's Arial (/System/Library/Fonts/Supplemental/Arial.ttf), the font the reference's doc is in.

The film keeps the reference's rain hook and its laptop shot, and changes what the rain types and
what it shows after (docs/rain-video-prompt.md). For that:

1. The doc model. The reference types into a Google Doc in Arial with 1.15 line spacing. The film
   draws its own words on that page, so it needs the page's own coordinates: a "doc" space where
   the text is 100 units tall, the left margin is x 50 and line k's baseline is y 150 + 132.5 k.
   The homography from that space onto frame 330 is fitted (ECC) to the reference's own lines,
   rendered in Arial.
2. Typing tracks. Every frame from the first replaced keystroke (219) to the last before the cut
   (405) gets the homography from doc space onto it: the page's text tracked frame to frame from
   frame 330 (optical flow, RANSAC). At 379 the doc scrolls four lines and reflows (a page break),
   which the flow can't follow, so the frames after it are tracked from frame 400, whose doc
   homography comes from the screen's toolbar and dock matched to frame 330's plus the scroll,
   measured. The four scroll frames (379-382) are the laptop's own blend of both positions.
3. Typing plates. In each of those frames the reference's own words are wiped off the paper
   inside the lines they're typed on (a grey closing, which keeps the paper's own light and drops
   the dark strokes), so only the gibberish above stays. In the scroll frames the whole text area
   is wiped, and the film draws every line, twice, as the reference's blend. They go to
   public/rain/plates/typing/<frame>.jpg (gitignored).
4. Shot plates and tracks. The five car shots: one frame per shot with the car inpainted by LaMa
   (big-lama, Apache 2.0, the ONNX export the Crush film downloads into out/work/crush/), and the
   shot's camera (zoom, turn, shift) tracked frame to frame with the car masked out. Plates go to
   public/rain/plates/<shot>.png.

Everything measured is written to src/rain/tracks.ts (generated: never edit it by hand).
"""

import json
import subprocess
from pathlib import Path

import cv2
import numpy as np
import onnxruntime
from PIL import Image, ImageDraw, ImageFilter, ImageFont

REFERENCE_PATH = Path("../keywordType.mp4")
WORK_DIRECTORY = Path("out/work/rain")
FRAMES_DIRECTORY = WORK_DIRECTORY / "frames"
MODEL_PATH = Path("out/work/crush/lama_fp32.onnx")
MODEL_URL = "https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx"
PLATES_DIRECTORY = Path("public/rain/plates")
TRACKS_PATH = Path("src/rain/tracks.ts")
ARIAL_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf"
REFERENCE_WIDTH = 720
REFERENCE_HEIGHT = 1280

# The doc space (see 1. above).
DOC_FONT_SIZE = 100
DOC_LEFT_X = 50
DOC_FIRST_BASELINE_Y = 150
DOC_LINE_PITCH = 132.5
# The reference's lines on frame 330, from line 1 (line 0, "GGchgbvjkfdg", is cut by the toolbar).
FIT_FRAME = 330
FIT_LINES = ["hf72jfb", "bduhwo28bcjkb", "YUFG783BFC", "HGBXHGVEU", "Y BUY THE", "CORVETTE"]
# Where the YUFG783BFC and CORVETTE baselines start on frame 330: the fit's first guess.
FIT_GUESS = {"YUFG783BFC": (189, 502), "CORVETTE": (194, 674)}

# The typing shot's frames (see 2. above).
TYPING_START_FRAME = 219
TYPING_END_FRAME = 406
SCROLL_START_FRAME = 379
AFTER_SCROLL_FRAME = 383
AFTER_SCROLL_ANCHOR_FRAME = 400
# The page's text on the anchor frames, where features are tracked.
PAGE_ON_FIT_FRAME = [[150, 300], [565, 300], [565, 705], [150, 705]]
PAGE_ON_AFTER_SCROLL_FRAME = [[160, 300], [580, 300], [580, 780], [160, 780]]
# The screen's toolbar and dock on frames 330 and 400: everything but the page and the keyboard.
TEXT_AREA_ON_FIT_FRAME = [[130, 285], [580, 285], [580, 715], [130, 715]]
TEXT_AREA_ON_AFTER_SCROLL_FRAME = [[140, 285], [620, 285], [620, 790], [140, 790]]

# The lines the rain types on, as doc baselines: the reference's "Y BUY THE" (line 5), its
# "CORVETTE" before the scroll (line 6), and after the scroll, page 2's "CORVETTE!!!!!" and "!!!!".
# The scroll moves the doc up by DOC_SCROLL_UNITS; after it, page 2's lines are at these doc
# baselines (measured on frame 400 by matching the lines in Arial).
DOC_SCROLL_UNITS = 533.0
TYPED_LINE_BASELINES_BEFORE_SCROLL = [DOC_FIRST_BASELINE_Y + 5 * DOC_LINE_PITCH, DOC_FIRST_BASELINE_Y + 6 * DOC_LINE_PITCH]
# How far each typed line's wipe reaches above and below its baseline, and to the right.
WIPE_ABOVE_BASELINE_UNITS = 98
WIPE_BELOW_BASELINE_UNITS = 34
WIPE_RIGHT_X = 820
# Between the page's end and the dock's icons, in doc units.
DOCK_GAP_UNITS = 12
# The scroll frames wipe every line, from line 0's top to the last line's bottom.
WIPE_ALL_TOP_Y = DOC_FIRST_BASELINE_Y - WIPE_ABOVE_BASELINE_UNITS - 20
WIPE_ALL_BOTTOM_Y = DOC_FIRST_BASELINE_Y + 9 * DOC_LINE_PITCH

MODEL_SIZE = 512
CROP_MARGIN_PIXELS = 140

Region = tuple

# The five car shots: name -> (first frame, end frame, plate frame, the car's regions on the plate
# frame). The car is masked out of the tracking on every frame by the same regions, grown.
CAR_SHOTS: dict[str, tuple[int, int, int, list[Region]]] = {
    "palms": (406, 429, 417, [("polygon", 170, 700, 230, 640, 430, 640, 520, 690, 550, 760, 540, 840, 300, 860, 180, 825)]),
    "close": (429, 451, 440, [("polygon", 0, 330, 340, 340, 460, 400, 580, 560, 600, 760, 560, 1000, 380, 1070, 0, 1080)]),
    "front": (451, 475, 462, [("polygon", 140, 560, 240, 515, 480, 515, 580, 555, 615, 700, 595, 860, 125, 860, 105, 700)]),
    "rear": (475, 496, 485, [("polygon", 0, 470, 380, 450, 600, 470, 680, 600, 670, 900, 480, 1060, 0, 1070)]),
    "night": (496, 520, 508, [("polygon", 95, 750, 220, 640, 540, 615, 700, 655, 720, 760, 715, 935, 450, 970, 95, 905)]),
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
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["curl", "-sSfL", "--retry", "3", "-o", str(MODEL_PATH), MODEL_URL], check=True)


def read_frame(frame: int) -> np.ndarray:
    return cv2.imread(str(FRAMES_DIRECTORY / f"{frame:04d}.png"))


def read_gray(frame: int) -> np.ndarray:
    return cv2.cvtColor(read_frame(frame), cv2.COLOR_BGR2GRAY)


def doc_baseline(line: int) -> float:
    return DOC_FIRST_BASELINE_Y + line * DOC_LINE_PITCH


def render_doc_lines(lines: dict[float, str], size: tuple[int, int]) -> np.ndarray:
    """Black Arial lines on white, in doc units: {baseline y: text}."""
    font = ImageFont.truetype(ARIAL_PATH, DOC_FONT_SIZE)
    image = Image.new("L", size, 255)
    draw = ImageDraw.Draw(image)
    for baseline, text in lines.items():
        draw.text((DOC_LEFT_X, baseline), text, font=font, fill=0, anchor="ls")
    return np.array(image, dtype=np.float32)


def fit_doc_homography() -> np.ndarray:
    """The homography from doc space onto frame 330, fitted to the reference's own lines."""
    lines = {doc_baseline(index + 1): text for index, text in enumerate(FIT_LINES)}
    first_baseline, last_baseline = min(lines), max(lines)
    top = int(first_baseline - DOC_LINE_PITCH - 40)
    bottom = int(last_baseline + 40)
    template = cv2.GaussianBlur(render_doc_lines(lines, (1100, bottom + 10)), (0, 0), 2.0)[top:bottom]
    frame = cv2.GaussianBlur(read_gray(FIT_FRAME).astype(np.float32), (0, 0), 1.0)
    yufg_baseline = doc_baseline(FIT_LINES.index("YUFG783BFC") + 1)
    corvette_baseline = doc_baseline(FIT_LINES.index("CORVETTE") + 1)
    guess = cv2.getAffineTransform(
        np.float32([[DOC_LEFT_X, yufg_baseline], [DOC_LEFT_X, corvette_baseline], [DOC_LEFT_X + 600, yufg_baseline]]),
        np.float32([FIT_GUESS["YUFG783BFC"], FIT_GUESS["CORVETTE"], [FIT_GUESS["YUFG783BFC"][0] + 300, FIT_GUESS["YUFG783BFC"][1]]]),
    )
    crop_shift = np.array([[1, 0, 0], [0, 1, top], [0, 0, 1]], dtype=np.float64)
    initial = (np.vstack([guess, [0, 0, 1]]) @ crop_shift).astype(np.float32)
    correlation, fitted = cv2.findTransformECC(
        template, frame, initial, cv2.MOTION_HOMOGRAPHY,
        (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), None, 5,
    )
    print(f"doc fit on frame {FIT_FRAME}: correlation {correlation:.3f}")
    return fitted.astype(np.float64) @ np.linalg.inv(crop_shift)


def estimate_flow_step(from_frame: int, to_frame: int, page_on_from: np.ndarray) -> np.ndarray | None:
    """The homography taking from_frame's page text onto to_frame's, from tracked corners."""
    from_image, to_image = read_gray(from_frame), read_gray(to_frame)
    mask = np.zeros_like(from_image)
    cv2.fillPoly(mask, [page_on_from.astype(np.int32)], 255)
    points = cv2.goodFeaturesToTrack(from_image, 800, 0.01, 6, mask=mask)
    if points is None or len(points) < 20:
        return None
    moved, status, _ = cv2.calcOpticalFlowPyrLK(from_image, to_image, points, None, winSize=(31, 31), maxLevel=4)
    back, back_status, _ = cv2.calcOpticalFlowPyrLK(to_image, from_image, moved, None, winSize=(31, 31), maxLevel=4)
    kept = (status[:, 0] == 1) & (back_status[:, 0] == 1) & (np.linalg.norm(back - points, axis=2)[:, 0] < 1.0)
    if kept.sum() < 20:
        return None
    step, inliers = cv2.findHomography(points[kept], moved[kept], cv2.RANSAC, 1.5)
    if step is None or inliers is None or inliers.sum() < 15:
        return None
    return step


def track_from_anchor(anchor_frame: int, first_frame: int, last_frame: int, page_on_anchor: list) -> dict[int, np.ndarray]:
    """Per frame, the homography from the anchor frame onto it, chained out from the anchor."""
    page = np.float32(page_on_anchor)[None]
    by_frame = {anchor_frame: np.eye(3)}
    for direction in (1, -1):
        frame = anchor_frame
        while first_frame <= frame + direction <= last_frame:
            page_on_frame = cv2.perspectiveTransform(page, by_frame[frame])[0]
            step = estimate_flow_step(frame, frame + direction, page_on_frame)
            by_frame[frame + direction] = (np.eye(3) if step is None else step) @ by_frame[frame]
            if step is None:
                print(f"  frame {frame + direction}: no fit, held")
            frame += direction
    return by_frame


def match_screen(from_frame: int, to_frame: int, text_on_from: list, text_on_to: list) -> np.ndarray:
    """The homography between two frames' screens, from the toolbar and dock (not the page)."""
    orb = cv2.ORB_create(5000)
    found = []
    for frame, text_area in ((from_frame, text_on_from), (to_frame, text_on_to)):
        mask = np.full((REFERENCE_HEIGHT, REFERENCE_WIDTH), 255, np.uint8)
        cv2.fillPoly(mask, [np.int32(text_area)], 0)
        mask[:150] = 0
        mask[900:] = 0
        found.append(orb.detectAndCompute(read_gray(frame), mask))
    (from_points, from_descriptors), (to_points, to_descriptors) = found
    pairs = cv2.BFMatcher(cv2.NORM_HAMMING).knnMatch(from_descriptors, to_descriptors, k=2)
    good = [pair[0] for pair in pairs if len(pair) == 2 and pair[0].distance < 0.75 * pair[1].distance]
    source = np.float32([from_points[match.queryIdx].pt for match in good])
    target = np.float32([to_points[match.trainIdx].pt for match in good])
    homography, inliers = cv2.findHomography(source, target, cv2.RANSAC, 2.0)
    print(f"screen match {from_frame} -> {to_frame}: {int(inliers.sum())} of {len(good)} matches")
    return homography


def translate(dx: float, dy: float) -> np.ndarray:
    return np.array([[1, 0, dx], [0, 1, dy], [0, 0, 1]], dtype=np.float64)


def build_typing_tracks() -> dict[int, np.ndarray]:
    """Per typing frame, the homography from doc space onto the reference's frame. Doc space is
    the doc before the scroll: after it, the same doc point is DOC_SCROLL_UNITS higher on screen.
    The scroll frames get the last frame before it (the film blends both positions itself)."""
    doc_on_fit_frame = fit_doc_homography()
    print("tracking the page before the scroll")
    before = track_from_anchor(FIT_FRAME, TYPING_START_FRAME, SCROLL_START_FRAME - 1, PAGE_ON_FIT_FRAME)
    print("tracking the page after the scroll")
    after = track_from_anchor(AFTER_SCROLL_ANCHOR_FRAME, AFTER_SCROLL_FRAME, TYPING_END_FRAME - 1, PAGE_ON_AFTER_SCROLL_FRAME)
    screen = match_screen(FIT_FRAME, AFTER_SCROLL_ANCHOR_FRAME, TEXT_AREA_ON_FIT_FRAME, TEXT_AREA_ON_AFTER_SCROLL_FRAME)
    doc_on_after_anchor = screen @ doc_on_fit_frame @ translate(0, -DOC_SCROLL_UNITS)
    tracks: dict[int, np.ndarray] = {}
    for frame in range(TYPING_START_FRAME, TYPING_END_FRAME):
        if frame < SCROLL_START_FRAME:
            tracks[frame] = before[frame] @ doc_on_fit_frame
        elif frame < AFTER_SCROLL_FRAME:
            tracks[frame] = before[SCROLL_START_FRAME - 1] @ doc_on_fit_frame
        else:
            tracks[frame] = after[frame] @ doc_on_after_anchor
    # Where the scroll ends, as seen from before it: the scroll frames' second position.
    tracks[-1] = after[AFTER_SCROLL_FRAME] @ doc_on_after_anchor
    return tracks


def rectify(frame: int, doc_on_frame: np.ndarray, size=(1100, 2100)) -> np.ndarray:
    return cv2.warpPerspective(read_gray(frame), np.linalg.inv(doc_on_frame), size, flags=cv2.INTER_LINEAR, borderValue=255)


def measure_after_scroll_lines(tracks: dict[int, np.ndarray]) -> None:
    """Prints where the reference's lines sit after the scroll, in doc space (for the constants)."""
    rectified = cv2.GaussianBlur(rectify(AFTER_SCROLL_ANCHOR_FRAME, tracks[AFTER_SCROLL_ANCHOR_FRAME]).astype(np.float32), (0, 0), 1.5)
    font = ImageFont.truetype(ARIAL_PATH, DOC_FONT_SIZE)
    for text, from_y in (("Y BUY THE", 0), ("CORVETTE!!!!!", 0), ("!!!!", 1300)):
        width = int(font.getlength(text)) + 20
        image = Image.new("L", (width, 140), 255)
        ImageDraw.Draw(image).text((10, 110), text, font=font, fill=0, anchor="ls")
        template = cv2.GaussianBlur(np.array(image, np.float32), (0, 0), 1.5)
        result = cv2.matchTemplate(rectified[from_y:], template, cv2.TM_CCOEFF_NORMED)
        _, score, _, location = cv2.minMaxLoc(result)
        print(f"  after the scroll, {text!r}: doc x {location[0] + 10}, baseline {location[1] + 110 + from_y} (score {score:.2f})")


def measure_typed_extents(tracks: dict[int, np.ndarray]) -> dict[str, list[int]]:
    """Per typed line, the right edge of the reference's ink on each frame (doc x), so the film's
    keystrokes can land on the reference's own."""
    lines_before = {"lineA": TYPED_LINE_BASELINES_BEFORE_SCROLL[0], "lineB": TYPED_LINE_BASELINES_BEFORE_SCROLL[1]}
    extents: dict[str, list[int]] = {name: [] for name in lines_before}
    for frame in range(TYPING_START_FRAME, SCROLL_START_FRAME):
        rectified = rectify(frame, tracks[frame]).astype(np.float32)
        background = cv2.dilate(rectified, np.ones((25, 25)))
        ink = (background - rectified) > 60
        for name, baseline in lines_before.items():
            band = ink[int(baseline - 80):int(baseline + 4), DOC_LEFT_X - 10:WIPE_RIGHT_X]
            columns = np.nonzero(band.sum(0) > 3)[0]
            extents[name].append(int(columns.max()) + DOC_LEFT_X - 10 if len(columns) else 0)
    return extents


def find_page(image: np.ndarray) -> np.ndarray:
    """The doc's white page (with the text on it), not the toolbar, the dock or the desk."""
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    paper = ((hsv[..., 2] > 165) & (hsv[..., 1] < 45)).astype(np.uint8) * 255
    page = cv2.morphologyEx(paper, cv2.MORPH_CLOSE, np.ones((31, 31), np.uint8))
    count, labels, stats, _ = cv2.connectedComponentsWithStats(page)
    largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return cv2.erode((labels == largest).astype(np.uint8) * 255, np.ones((7, 7), np.uint8))


def measure_viewport_bottom(frame: int, doc_on_frame: np.ndarray) -> int:
    """Where the doc's window ends, in doc y: just above the dock, the first band of colourful
    icons below the text. The window is VIEWPORT_HEIGHT_UNITS tall."""
    hsv = cv2.cvtColor(read_frame(frame), cv2.COLOR_BGR2HSV)
    colourful = ((hsv[..., 1] > 80) & (hsv[..., 2] > 60)).astype(np.uint8) * 255
    rectified = cv2.warpPerspective(colourful, np.linalg.inv(doc_on_frame), (900, 2100))
    share = (rectified > 0).mean(1)
    rows = np.nonzero(share > 0.15)[0]
    rows = rows[rows > DOC_FIRST_BASELINE_Y + 4 * DOC_LINE_PITCH]
    return int(rows[0]) - DOCK_GAP_UNITS if len(rows) else 2100


def wipe_regions(image: np.ndarray, doc_on_frame: np.ndarray, doc_boxes: list[tuple[float, float, float, float]], ink_contrast: int = 22, grow_pixels: int = 3) -> np.ndarray:
    """Wipes the text strokes inside the doc boxes (x0, y0, x1, y1) off the page: the strokes are
    found against the paper around them, grown a little and inpainted from the paper."""
    boxes = np.zeros(image.shape[:2], np.uint8)
    for x0, y0, x1, y1 in doc_boxes:
        corners = cv2.perspectiveTransform(np.float32([[[x0, y0], [x1, y0], [x1, y1], [x0, y1]]]), doc_on_frame)[0]
        cv2.fillPoly(boxes, [np.int32(np.round(corners))], 255)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY).astype(np.int16)
    paper_light = cv2.dilate(gray, np.ones((21, 21), np.uint8))
    ink = ((paper_light - gray) > ink_contrast).astype(np.uint8) * 255
    hole = cv2.bitwise_and(ink, cv2.bitwise_and(boxes, find_page(image)))
    hole = cv2.dilate(hole, np.ones((2 * grow_pixels + 1, 2 * grow_pixels + 1), np.uint8))
    wiped = cv2.inpaint(image, hole, 6, cv2.INPAINT_TELEA).astype(np.float32)
    # The paper's own fine grain, over the inpainted strokes only.
    grain = np.random.default_rng(0).normal(0, 1.5, image.shape[:2])[..., None]
    soft = cv2.GaussianBlur(hole.astype(np.float32) / 255, (0, 0), 1.0)[..., None]
    smoothed = cv2.GaussianBlur(wiped, (0, 0), 2.0)
    wiped = wiped * (1 - soft) + (smoothed + grain) * soft
    return np.clip(wiped, 0, 255).astype(np.uint8)


def build_typing_plates(tracks: dict[int, np.ndarray], viewport_bottoms: dict[int, int]) -> None:
    directory = PLATES_DIRECTORY / "typing"
    directory.mkdir(parents=True, exist_ok=True)
    after_scroll_baselines = AFTER_SCROLL_DOC_BASELINES
    for frame in range(TYPING_START_FRAME, TYPING_END_FRAME):
        image = read_frame(frame)
        if frame < SCROLL_START_FRAME:
            baselines = TYPED_LINE_BASELINES_BEFORE_SCROLL
        elif frame < AFTER_SCROLL_FRAME:
            baselines = []
        else:
            baselines = [TYPED_LINE_BASELINES_BEFORE_SCROLL[0], *after_scroll_baselines]
        # Only inside the doc's window: a line below it is behind the dock.
        bottom = viewport_bottoms[frame] - 6
        boxes = [
            (DOC_LEFT_X - 25, b - WIPE_ABOVE_BASELINE_UNITS, WIPE_RIGHT_X, min(bottom, b + WIPE_BELOW_BASELINE_UNITS))
            for b in baselines
            if b - WIPE_ABOVE_BASELINE_UNITS < bottom
        ]
        if SCROLL_START_FRAME <= frame < AFTER_SCROLL_FRAME:
            # Both positions' every line: the frame is the laptop's blend of the two.
            for doc_on_frame, window_bottom in ((tracks[frame], viewport_bottoms[SCROLL_START_FRAME - 1]), (tracks[-1], viewport_bottoms[AFTER_SCROLL_FRAME])):
                box = (DOC_LEFT_X - 25, WIPE_ALL_TOP_Y, WIPE_RIGHT_X, window_bottom - 6)
                image = wipe_regions(image, doc_on_frame, [box], ink_contrast=10, grow_pixels=5)
        else:
            image = wipe_regions(image, tracks[frame], boxes)
        cv2.imwrite(str(directory / f"{frame:04d}.jpg"), image, [cv2.IMWRITE_JPEG_QUALITY, 93])
    print(f"typing plates: frames {TYPING_START_FRAME}-{TYPING_END_FRAME - 1}")


# After the scroll, page 2's two typed lines, as doc baselines (see measure_after_scroll_lines).
AFTER_SCROLL_DOC_BASELINES = [812 + DOC_SCROLL_UNITS, 943 + DOC_SCROLL_UNITS]


def draw_regions(size: tuple[int, int], regions: list[Region]) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    for kind, *values in regions:
        if kind == "rect":
            draw.rectangle(values, fill=255)
        elif kind == "polygon":
            draw.polygon(list(zip(values[0::2], values[1::2])), fill=255)
    return mask


def inpaint(session: onnxruntime.InferenceSession, image: Image.Image, regions: list[Region]) -> Image.Image:
    mask = draw_regions(image.size, regions).filter(ImageFilter.MaxFilter(15))
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


def build_car_plates() -> None:
    PLATES_DIRECTORY.mkdir(parents=True, exist_ok=True)
    session = onnxruntime.InferenceSession(str(MODEL_PATH), providers=["CPUExecutionProvider"])
    for name, (_, _, plate_frame, regions) in CAR_SHOTS.items():
        image = Image.open(FRAMES_DIRECTORY / f"{plate_frame:04d}.png").convert("RGB")
        inpaint(session, image, regions).save(PLATES_DIRECTORY / f"{name}.png")
        print(f"plate {name}: frame {plate_frame}")


def estimate_similarity_step(orb, matcher, from_frame: int, to_frame: int, excluded: np.ndarray) -> np.ndarray:
    """The 2 x 3 similarity taking from_frame's pixels onto to_frame's, or identity if unsure."""
    feature_mask = np.where(excluded > 0, 0, 255).astype(np.uint8)
    (from_points, from_descriptors), (to_points, to_descriptors) = [
        orb.detectAndCompute(read_gray(frame), feature_mask) for frame in (from_frame, to_frame)
    ]
    identity = np.array([[1, 0, 0], [0, 1, 0]], dtype=np.float64)
    if from_descriptors is None or to_descriptors is None or len(from_points) < 12 or len(to_points) < 12:
        return identity
    pairs = matcher.knnMatch(from_descriptors, to_descriptors, k=2)
    good = [pair[0] for pair in pairs if len(pair) == 2 and pair[0].distance < 0.75 * pair[1].distance]
    if len(good) < 10:
        return identity
    source = np.float32([from_points[match.queryIdx].pt for match in good])
    target = np.float32([to_points[match.trainIdx].pt for match in good])
    transform, inliers = cv2.estimateAffinePartial2D(source, target, method=cv2.RANSAC, ransacReprojThreshold=2.5)
    if transform is None or inliers is None or inliers.sum() < 8:
        return identity
    return transform


def build_car_tracks() -> dict[str, list[list[float]]]:
    orb = cv2.ORB_create(nfeatures=3000)
    matcher = cv2.BFMatcher(cv2.NORM_HAMMING)
    tracks: dict[str, list[list[float]]] = {}
    for name, (start_frame, end_frame, plate_frame, regions) in CAR_SHOTS.items():
        excluded = np.array(draw_regions((REFERENCE_WIDTH, REFERENCE_HEIGHT), regions).filter(ImageFilter.MaxFilter(41)))
        by_frame = {plate_frame: np.eye(3)}
        for frame in range(plate_frame + 1, end_frame):
            step = np.vstack([estimate_similarity_step(orb, matcher, frame - 1, frame, excluded), [0, 0, 1]])
            by_frame[frame] = step @ by_frame[frame - 1]
        for frame in range(plate_frame - 1, start_frame - 1, -1):
            step = np.vstack([estimate_similarity_step(orb, matcher, frame + 1, frame, excluded), [0, 0, 1]])
            by_frame[frame] = step @ by_frame[frame + 1]
        # CSS matrix(a, b, c, d, e, f): x' = a x + c y + e, y' = b x + d y + f.
        tracks[name] = [
            [round(float(value), 5) for value in (m[0, 0], m[1, 0], m[0, 1], m[1, 1], m[0, 2], m[1, 2])]
            for m in (by_frame[frame] for frame in range(start_frame, end_frame))
        ]
        scales = [np.hypot(m[0], m[1]) for m in tracks[name]]
        print(f"track {name}: frames {start_frame}-{end_frame - 1}, zoom {min(scales):.3f}-{max(scales):.3f}")
    return tracks


def to_css_matrix3d(homography: np.ndarray) -> list[float]:
    """A 3 x 3 homography (x, y) -> (X / W, Y / W) as CSS matrix3d's 16 values, column-major."""
    h = homography / homography[2, 2]
    return [
        round(float(value), 8)
        for value in (h[0, 0], h[1, 0], 0, h[2, 0], h[0, 1], h[1, 1], 0, h[2, 1], 0, 0, 1, 0, h[0, 2], h[1, 2], 0, h[2, 2])
    ]


def write_tracks(typing_tracks: dict[int, np.ndarray], viewport_bottoms: dict[int, int], extents: dict[str, list[int]], car_tracks: dict[str, list[list[float]]]) -> None:
    lines = [
        "// GENERATED by scripts/build-rain-plates.py from ../keywordType.mp4. Do not edit by hand.",
        "",
        "export type CssMatrix = readonly [number, number, number, number, number, number]",
        "export type CssMatrix3d = readonly number[]",
        "",
        "/**",
        " * Per typing frame (from TYPING_START_FRAME), the CSS matrix3d that takes the doc space (Arial",
        " * 100 units tall, line k's baseline at y 150 + 132.5 k, before the scroll) onto the reference's",
        " * 720 x 1280 frame. The scroll frames hold the last frame before it.",
        " */",
        "export const typingDocMatrices: readonly CssMatrix3d[] = [",
        *[f"  {json.dumps(to_css_matrix3d(typing_tracks[frame]))}," for frame in range(TYPING_START_FRAME, TYPING_END_FRAME)],
        "]",
        "",
        "/**",
        " * Per typing frame, where the doc's window ends (the dock) in doc y: text below it is hidden.",
        " * The scroll frames hold the last frame before it. The window is 923 units tall.",
        " */",
        f"export const typingViewportBottoms: readonly number[] = {json.dumps([viewport_bottoms[frame] for frame in range(TYPING_START_FRAME, TYPING_END_FRAME)])}",
        "",
        f"/** The window's bottom where the scroll ends. */",
        f"export const afterScrollViewportBottom = {viewport_bottoms[AFTER_SCROLL_FRAME]}",
        "",
        "/** The doc's matrix3d where the scroll ends, as the scroll frames' second position. */",
        f"export const afterScrollDocMatrix: CssMatrix3d = {json.dumps(to_css_matrix3d(typing_tracks[-1]))}",
        "",
        "/**",
        " * The right edge of the reference's own ink on its two typed lines (doc x), per frame from",
        " * TYPING_START_FRAME to the scroll: where its keystrokes land. For reading, not drawing.",
        " */",
        "export const referenceTypedExtents = {",
        *[f"  {name}: {json.dumps(values)}," for name, values in extents.items()],
        "} as const",
        "",
        "export type RainCarShotName = " + " | ".join(f"'{name}'" for name in car_tracks),
        "",
        "/** Per car shot, one CSS matrix per frame that takes the shot's plate onto the reference's frame. */",
        "export const carShotTracks: Record<RainCarShotName, readonly CssMatrix[]> = {",
    ]
    for name, matrices in car_tracks.items():
        lines.append(f"  {name}: [")
        lines.extend(f"    {json.dumps(matrix)}," for matrix in matrices)
        lines.append("  ],")
    lines.append("}")
    TRACKS_PATH.parent.mkdir(parents=True, exist_ok=True)
    TRACKS_PATH.write_text("\n".join(lines) + "\n")


def main() -> None:
    WORK_DIRECTORY.mkdir(parents=True, exist_ok=True)
    extract_frames()
    download_model()
    typing_tracks = build_typing_tracks()
    measure_after_scroll_lines(typing_tracks)
    extents = measure_typed_extents(typing_tracks)
    measured = [measure_viewport_bottom(frame, typing_tracks[frame]) for frame in range(TYPING_START_FRAME, TYPING_END_FRAME)]
    # A frame's dock can blur away: each frame takes the median of its neighbours.
    viewport_bottoms = {
        frame: int(np.median(measured[max(0, index - 3):index + 4]))
        for index, frame in enumerate(range(TYPING_START_FRAME, TYPING_END_FRAME))
    }
    # The scroll frames are a blend of two windows: they hold the one before it, as their track does.
    for frame in range(SCROLL_START_FRAME, AFTER_SCROLL_FRAME):
        viewport_bottoms[frame] = viewport_bottoms[SCROLL_START_FRAME - 1]
    build_typing_plates(typing_tracks, viewport_bottoms)
    build_car_plates()
    write_tracks(typing_tracks, viewport_bottoms, extents, build_car_tracks())


if __name__ == "__main__":
    main()
