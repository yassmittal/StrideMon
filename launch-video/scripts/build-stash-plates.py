"""The Stash film's cleaned reference and case tracks, from ../nailpaints.mp4.

Run from launch-video/ (scripts/copy-stash-media.sh runs it):

    uv run --no-project --python 3.11 --with onnxruntime --with opencv-python-headless \
      --with pillow --with numpy python scripts/build-stash-plates.py

`uv` builds a throwaway environment, so nothing is installed in the repo. It needs ffmpeg and curl.

The film plays the reference as it is up to its case of press-on nails, then keeps the reference's
own hand, case and camera with Founding Pass Sneakers in the case instead (docs/stash-video-prompt.md).
For that:

1. The nail brand's burnt-in credit ("Yoobin. nailingit", under the caption) is inpainted out of
   every frame it's on, with LaMa (big-lama, Apache 2.0, the ONNX export the Crush film already
   downloads into out/work/crush/; it's fetched here if it isn't there).
2. Tracks. The case is rigid, so for every frame of its two shots one homography takes shot A's
   keyframe (230) onto that frame: SIFT features on the nails, matched straight to the keyframe of
   the frame's own shot, RANSAC-fitted. Shot B's keyframe (300) is tied to shot A's by the same
   nails, so the Sneakers are placed once, in shot A's keyframe pixels. Written to
   src/stash/tracks.ts (generated: never edit it by hand) as 3 x 3 matrices, row by row.
3. The case floor. The nails are inpainted out of shot A's keyframe once, and that clean floor is
   carried onto every case frame by its track and matched to the frame's own light, so no nail
   shows round the Sneakers.
4. The cleaned frames are encoded to public/stash/reference.mp4 (gitignored), which the film plays.
"""

import json
import shutil
import subprocess
from pathlib import Path

import cv2
import numpy as np
import onnxruntime
from PIL import Image, ImageDraw, ImageFilter

REFERENCE_PATH = Path("../nailpaints.mp4")
WORK_DIRECTORY = Path("out/work/stash")
FRAMES_DIRECTORY = WORK_DIRECTORY / "frames"
CLEAN_DIRECTORY = WORK_DIRECTORY / "clean"
MODEL_PATH = Path("out/work/crush/lama_fp32.onnx")
MODEL_URL = "https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx"
OUTPUT_VIDEO_PATH = Path("public/stash/reference.mp4")
TRACKS_PATH = Path("src/stash/tracks.ts")
FRAMES_PER_SECOND = 30
FRAME_SIZE = (720, 1280)
MODEL_SIZE = 512
CROP_MARGIN_PIXELS = 140

# The credit sits under the caption from the first frame until the hand comes in.
CREDIT_RECT = (22, 830, 152, 862)
CREDIT_END_FRAME = 202

# The case's two shots: (first frame, end frame (not included), keyframe, the nails on the keyframe).
SHOT_A = (202, 268, 230, [100, 430, 600, 425, 605, 640, 585, 835, 320, 852, 150, 845, 88, 700])
SHOT_B = (268, 335, 300, [140, 275, 380, 285, 560, 395, 720, 420, 720, 720, 595, 720, 585, 885, 450, 965,
                           330, 905, 225, 855, 0, 805, 0, 440, 115, 330])


def extract_frames() -> None:
    if FRAMES_DIRECTORY.exists() and any(FRAMES_DIRECTORY.iterdir()):
        return
    FRAMES_DIRECTORY.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "error", "-i", str(REFERENCE_PATH), "-start_number", "0",
         str(FRAMES_DIRECTORY / "%04d.png")],
        check=True,
    )


def read_frame(frame: int) -> np.ndarray:
    return cv2.imread(str(FRAMES_DIRECTORY / f"{frame:04d}.png"))


def frame_count() -> int:
    return len(list(FRAMES_DIRECTORY.glob("*.png")))


def polygon_mask(points: list[int]) -> np.ndarray:
    mask = Image.new("L", FRAME_SIZE, 0)
    ImageDraw.Draw(mask).polygon(list(zip(points[0::2], points[1::2])), fill=255)
    return np.array(mask)


class Tracker:
    def __init__(self) -> None:
        self.sift = cv2.SIFT_create(nfeatures=4000)
        self.matcher = cv2.BFMatcher(cv2.NORM_L2)

    def features(self, image: np.ndarray, mask: np.ndarray | None):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return self.sift.detectAndCompute(gray, mask)

    def homography(self, source, target) -> tuple[np.ndarray | None, int]:
        (source_points, source_descriptors), (target_points, target_descriptors) = source, target
        if source_descriptors is None or target_descriptors is None:
            return None, 0
        matches = self.matcher.knnMatch(source_descriptors, target_descriptors, k=2)
        good = [pair[0] for pair in matches if len(pair) == 2 and pair[0].distance < 0.75 * pair[1].distance]
        if len(good) < 12:
            return None, len(good)
        source_xy = np.float32([source_points[match.queryIdx].pt for match in good])
        target_xy = np.float32([target_points[match.trainIdx].pt for match in good])
        matrix, inliers = cv2.findHomography(source_xy, target_xy, cv2.RANSAC, 3.0)
        if matrix is None or inliers is None or inliers.sum() < 12:
            return None, 0 if inliers is None else int(inliers.sum())
        return matrix, int(inliers.sum())


def track_shot(tracker: Tracker, shot) -> dict[int, np.ndarray]:
    """keyframe -> frame homographies for every frame of the shot that fits; the rest are left out."""
    start_frame, end_frame, keyframe, nails = shot
    dilated = cv2.dilate(polygon_mask(nails), np.ones((31, 31), np.uint8))
    key_features = tracker.features(read_frame(keyframe), dilated)
    by_frame: dict[int, np.ndarray] = {}
    for frame in range(start_frame, end_frame):
        matrix, inlier_count = tracker.homography(key_features, tracker.features(read_frame(frame), None))
        print(f"  frame {frame}: {inlier_count} inliers{'' if matrix is not None else ' (no fit)'}")
        if matrix is not None:
            by_frame[frame] = matrix / matrix[2, 2]
    return by_frame


def chain_shot(tracker: Tracker, shot) -> dict[int, np.ndarray]:
    """keyframe -> frame homographies chained frame to frame outward from the keyframe, for a shot
    whose focus and size change too much to match every frame straight to its keyframe. Features
    are taken on the nails only (the keyframe's nails carried by the track so far)."""
    start_frame, end_frame, keyframe, nails = shot
    nails_mask = cv2.dilate(polygon_mask(nails), np.ones((31, 31), np.uint8))
    by_frame = {keyframe: np.eye(3)}
    for direction, frames in ((1, range(keyframe + 1, end_frame)), (-1, range(keyframe - 1, start_frame - 1, -1))):
        for frame in frames:
            previous = by_frame[frame - direction]
            previous_mask = cv2.warpPerspective(nails_mask, previous, FRAME_SIZE)
            step, inlier_count = tracker.homography(
                tracker.features(read_frame(frame - direction), previous_mask),
                tracker.features(read_frame(frame), None),
            )
            if step is None:
                print(f"  frame {frame}: {inlier_count} inliers (no fit, the shot's track stops here)")
                break
            by_frame[frame] = step @ previous
            by_frame[frame] /= by_frame[frame][2, 2]
            print(f"  frame {frame}: {inlier_count} inliers")
    return by_frame


# The ten nails' middles on both keyframes, read off grids drawn on them: the seed for tying shot
# B's keyframe to shot A's (straight matching finds too few: the view turns and closes in at once).
NAIL_MIDDLES_A = [(175, 510), (275, 535), (360, 520), (460, 510), (550, 510),
                  (135, 735), (255, 740), (355, 740), (450, 740), (540, 720)]
NAIL_MIDDLES_B = [(195, 355), (310, 420), (405, 470), (525, 500), (630, 580),
                  (35, 680), (175, 650), (290, 720), (395, 780), (505, 820)]


def tie_keyframes() -> np.ndarray:
    """Shot A's keyframe -> shot B's: the nail middles' fit, refined by ECC on the nails."""
    seed, _ = cv2.findHomography(np.float32(NAIL_MIDDLES_A), np.float32(NAIL_MIDDLES_B), 0)
    half = np.diag([0.5, 0.5, 1.0])
    gray_a, gray_b = (
        cv2.GaussianBlur(cv2.resize(cv2.cvtColor(read_frame(frame), cv2.COLOR_BGR2GRAY), (360, 640)), (0, 0), 1.5)
        for frame in (SHOT_A[2], SHOT_B[2])
    )
    nails_b = cv2.resize(polygon_mask(SHOT_B[3]), (360, 640), interpolation=cv2.INTER_NEAREST)
    # ECC's warp takes the template's (B's) pixels to the input's (A's).
    warp = (half @ np.linalg.inv(seed) @ np.linalg.inv(half)).astype(np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 400, 1e-6)
    correlation, warp = cv2.findTransformECC(gray_b, gray_a, warp, cv2.MOTION_HOMOGRAPHY, criteria, nails_b, 5)
    print(f"A -> B: ECC correlation {correlation:.3f}")
    tied = np.linalg.inv(half) @ np.linalg.inv(warp.astype(np.float64)) @ half
    return tied / tied[2, 2]


def download_model() -> None:
    if MODEL_PATH.exists():
        return
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["curl", "-sSfL", "--retry", "3", "-o", str(MODEL_PATH), MODEL_URL], check=True)


def inpaint(session: onnxruntime.InferenceSession, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """LaMa on a crop round the hole (BGR in and out); only the hole is pasted back, feathered."""
    rows, columns = np.nonzero(mask)
    left = max(0, columns.min() - CROP_MARGIN_PIXELS)
    top = max(0, rows.min() - CROP_MARGIN_PIXELS)
    right = min(image.shape[1], columns.max() + CROP_MARGIN_PIXELS)
    bottom = min(image.shape[0], rows.max() + CROP_MARGIN_PIXELS)
    crop = cv2.cvtColor(image[top:bottom, left:right], cv2.COLOR_BGR2RGB)
    crop_mask = mask[top:bottom, left:right]
    model_image = cv2.resize(crop, (MODEL_SIZE, MODEL_SIZE), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
    model_mask = cv2.resize(crop_mask, (MODEL_SIZE, MODEL_SIZE), interpolation=cv2.INTER_NEAREST).astype(np.float32)
    result = session.run(
        None,
        {
            "image": model_image.transpose(2, 0, 1)[None] / 255,
            "mask": (model_mask > 127).astype(np.float32)[None, None],
        },
    )[0][0].transpose(1, 2, 0)
    if result.max() <= 1.5:
        result = result * 255
    filled = cv2.resize(np.clip(result, 0, 255).astype(np.uint8), (crop.shape[1], crop.shape[0]),
                        interpolation=cv2.INTER_LANCZOS4)
    feather = cv2.GaussianBlur(crop_mask.astype(np.float32) / 255, (0, 0), 3)[..., None]
    plate = image.copy()
    plate[top:bottom, left:right] = (cv2.cvtColor(filled, cv2.COLOR_RGB2BGR) * feather
                                     + image[top:bottom, left:right] * (1 - feather)).astype(np.uint8)
    return plate


def build_case_floor(session: onnxruntime.InferenceSession) -> tuple[np.ndarray, np.ndarray]:
    """Shot A's keyframe with its nails taken out, and the hole (with their shadows) as a mask."""
    hole = cv2.dilate(polygon_mask(SHOT_A[3]), np.ones((25, 25), np.uint8))
    floor = inpaint(session, read_frame(SHOT_A[2]), hole)
    cv2.imwrite(str(WORK_DIRECTORY / "case-floor.png"), floor)
    return floor, hole


def read_case_matrix(tracks, frame: int) -> np.ndarray | None:
    """Shot A's keyframe -> this frame, or None off the case's two shots (and in the whip)."""
    if SHOT_A[0] - 5 <= frame < SHOT_A[1]:
        # The case fades up from black: its first dark frames take the first one that fits.
        return tracks["a"][max(frame, min(tracks["a"]))]
    if frame in tracks["b"]:
        return tracks["b"][frame] @ tracks["a_to_b"]
    return None


def lay_case_floor(image: np.ndarray, floor: np.ndarray, hole: np.ndarray, matrix: np.ndarray) -> tuple[np.ndarray, float]:
    """The clean floor carried onto this frame and matched to its light, plus that light's level
    against the keyframe's (the film dims or lifts the Sneakers by it)."""
    warped_floor = cv2.warpPerspective(floor, matrix, FRAME_SIZE, flags=cv2.INTER_LINEAR)
    warped_hole = cv2.warpPerspective(hole, matrix, FRAME_SIZE, flags=cv2.INTER_LINEAR)
    in_frame = cv2.warpPerspective(np.full(hole.shape, 255, np.uint8), matrix, FRAME_SIZE) > 250
    ring = (cv2.dilate(warped_hole, np.ones((41, 41), np.uint8)) > 0) & (warped_hole == 0) & in_frame
    gain = np.ones(3)
    if ring.sum() > 500:
        gain = image[ring].mean(axis=0) / np.maximum(warped_floor[ring].mean(axis=0), 1)
        gain = np.clip(gain, 0.05, 1.6)
    feather = cv2.GaussianBlur(warped_hole.astype(np.float32) / 255, (0, 0), 6)[..., None]
    matched = np.clip(warped_floor * gain, 0, 255)
    composed = (matched * feather + image * (1 - feather)).astype(np.uint8)
    return composed, float(gain.mean())


def remove_credit(session: onnxruntime.InferenceSession, image: np.ndarray) -> np.ndarray:
    mask = np.zeros(image.shape[:2], np.uint8)
    left, top, right, bottom = CREDIT_RECT
    mask[top:bottom, left:right] = 255
    return inpaint(session, image, mask)


def build_clean_frames(tracks, floor: np.ndarray, hole: np.ndarray, session) -> dict[int, float]:
    if CLEAN_DIRECTORY.exists():
        shutil.rmtree(CLEAN_DIRECTORY)
    CLEAN_DIRECTORY.mkdir(parents=True)
    light_by_frame: dict[int, float] = {}
    for frame in range(frame_count()):
        image = read_frame(frame)
        if frame < CREDIT_END_FRAME:
            image = remove_credit(session, image)
        matrix = read_case_matrix(tracks, frame)
        if matrix is not None:
            image, light_by_frame[frame] = lay_case_floor(image, floor, hole, matrix)
        cv2.imwrite(str(CLEAN_DIRECTORY / f"{frame:04d}.png"), image)
    return light_by_frame


def encode_clean_frames() -> None:
    OUTPUT_VIDEO_PATH.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "error", "-y", "-framerate", str(FRAMES_PER_SECOND), "-start_number", "0",
         "-i", str(CLEAN_DIRECTORY / "%04d.png"), "-c:v", "libx264", "-crf", "12", "-preset", "slow",
         "-pix_fmt", "yuv420p", "-g", "1", str(OUTPUT_VIDEO_PATH)],
        check=True,
    )


def write_tracks(tracks, light_by_frame: dict[int, float]) -> None:
    # Every frame of the case's shots (whip frames left out): the 3 x 3 matrix, row by row, that
    # takes shot A's keyframe pixels onto that frame, and the frame's light against the keyframe's.
    entries = []
    for frame in sorted(light_by_frame):
        matrix = read_case_matrix(tracks, frame)
        values = [round(float(value), 7) for value in (matrix / matrix[2, 2]).flatten()]
        entries.append(f"  {frame}: {{ matrix: {json.dumps(values)}, light: {light_by_frame[frame]:.3f} }},")
    lines = [
        "// GENERATED by scripts/build-stash-plates.py from ../nailpaints.mp4. Do not edit by hand.",
        "// For every frame the case is tracked on: the homography (3 x 3, row by row) that takes shot",
        "// A's keyframe pixels (the reference's 720 x 1280) onto that frame, and the frame's light",
        "// round the case floor against the keyframe's.",
        "",
        "export type CaseTrackFrame = { matrix: readonly number[]; light: number }",
        "",
        "export const caseTrack: Record<number, CaseTrackFrame> = {",
        *entries,
        "}",
    ]
    TRACKS_PATH.parent.mkdir(parents=True, exist_ok=True)
    TRACKS_PATH.write_text("\n".join(lines) + "\n")


def main() -> None:
    WORK_DIRECTORY.mkdir(parents=True, exist_ok=True)
    extract_frames()
    download_model()
    tracker = Tracker()
    print("shot A")
    track_a = track_shot(tracker, SHOT_A)
    print("shot B")
    track_b = chain_shot(tracker, SHOT_B)
    tracks = {"a": track_a, "b": track_b, "a_to_b": tie_keyframes()}
    session = onnxruntime.InferenceSession(str(MODEL_PATH), providers=["CPUExecutionProvider"])
    floor, hole = build_case_floor(session)
    light_by_frame = build_clean_frames(tracks, floor, hole, session)
    encode_clean_frames()
    write_tracks(tracks, light_by_frame)
    print(f"Cleaned {frame_count()} frames; the case is tracked on {len(light_by_frame)}.")


if __name__ == "__main__":
    main()
