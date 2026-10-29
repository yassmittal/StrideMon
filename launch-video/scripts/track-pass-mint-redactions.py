"""Tracks where the Pass mint film must blur Yash's email (and the browser's autofill list, which
shows a phone number too) in the desktop recording, and writes src/pass-mint/redactions.ts.

Run by scripts/copy-pass-mint-media.sh:

    uv run --no-project --with opencv-python-headless==4.12.0.88 --with numpy \
      python scripts/track-pass-mint-redactions.py ../desktopFounderPassMint.mp4

The recording's own zoom (Screen Studio) moves and scales the mint dialog on almost every frame, so
the boxes can't be fixed. Instead, each frame in a redaction window is searched for the dialog's
title, "Cherry Runner Dawn" (multi-scale template matching), and each box sits at a fixed offset
from it, scaled with it. The offsets were measured on full frames (10.9 s, 11.8 s, 19.6 s, 20.4 s).
Where the title is cut off by the frame's edge, only its last word, "Dawn", is searched. A frame
whose match is weak borrows the nearest good one within a few frames; if there's none, it gets no
box (the wallet sheet's own blurred backdrop covers the dialog then).
"""

import sys
from pathlib import Path

import cv2
import numpy as np

RECORDING_FILE = sys.argv[1]
OUTPUT_FILE = Path("src/pass-mint/redactions.ts")
FRAMES_PER_SECOND = 60

# The title on frame 20.4 s (frame 1224) at scale 1: the template every offset is measured from.
TEMPLATE_FRAME = 1224
TEMPLATE_BOX = (185, 228, 645, 72)  # x, y, width, height in source pixels
# "Dawn" alone starts this far into the title.
DAWN_OFFSET_X = 480

# Boxes in title units: (x, y, width, height) from the title's top-left, at the template's scale.
# Each is active between its two times (seconds in the recording).
BOX_KINDS = {
    # The email field, typed and autofilled.
    "emailField": ((30, 313, 345, 82), [(10.0, 11.72)]),
    # The browser's autofill list: two emails and a phone number.
    "autofillList": ((166, 398, 335, 162), [(10.05, 11.12)]),
    # "We sent a code to <email>. It works for 10 minutes."
    "sentLine": ((185, 276, 345, 48), [(11.65, 12.45), (19.2, 20.02)]),
    # "Checked: <email>"
    "checkedLine": ((122, 202, 345, 48), [(19.95, 27.0)]),
}
WINDOWS = [(9.95, 12.5), (19.15, 27.0)]
# "Dawn" alone is only searched here, where the dialog is pushed off the left edge.
DAWN_ONLY_WINDOW = (23.9, 27.0)

WORK_SCALE = 0.5
MIN_SCORE = 0.72
MAX_BORROW_FRAMES = 8


def read_frames(path):
    capture = cv2.VideoCapture(path)
    index = 0
    while True:
        ok, frame = capture.read()
        if not ok:
            return
        yield index, frame
        index += 1


def to_work_gray(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return cv2.resize(gray, None, fx=WORK_SCALE, fy=WORK_SCALE, interpolation=cv2.INTER_AREA)


def search(gray, template, scales):
    best = (-1.0, None)
    for scale in scales:
        resized = cv2.resize(template, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
        if resized.shape[0] >= gray.shape[0] or resized.shape[1] >= gray.shape[1]:
            continue
        result = cv2.matchTemplate(gray, resized, cv2.TM_CCOEFF_NORMED)
        _, score, _, location = cv2.minMaxLoc(result)
        if score > best[0]:
            best = (score, (location[0] / WORK_SCALE, location[1] / WORK_SCALE, float(scale)))
    return best


def main():
    frame_seconds = lambda index: index / FRAMES_PER_SECOND  # noqa: E731
    in_window = lambda seconds, windows: any(a <= seconds <= b for a, b in windows)  # noqa: E731

    matches = {}
    previous_scale = None
    # The template frame comes after the first window, so it's read first.
    capture = cv2.VideoCapture(RECORDING_FILE)
    capture.set(cv2.CAP_PROP_POS_FRAMES, TEMPLATE_FRAME)
    ok, template_frame = capture.read()
    if not ok:
        raise SystemExit("Couldn't read the template frame.")
    x, y, width, height = TEMPLATE_BOX
    full_gray = cv2.cvtColor(template_frame, cv2.COLOR_BGR2GRAY)
    title_crop = full_gray[y : y + height, x : x + width]
    dawn_crop = full_gray[y : y + height, x + DAWN_OFFSET_X : x + width]
    title_template = cv2.resize(title_crop, None, fx=WORK_SCALE, fy=WORK_SCALE, interpolation=cv2.INTER_AREA)
    dawn_template = cv2.resize(dawn_crop, None, fx=WORK_SCALE, fy=WORK_SCALE, interpolation=cv2.INTER_AREA)

    for index, frame in read_frames(RECORDING_FILE):
        seconds = frame_seconds(index)
        if not in_window(seconds, WINDOWS):
            previous_scale = None
            continue
        gray = to_work_gray(frame)
        if previous_scale is None:
            scales = np.arange(0.5, 1.8, 0.02)
        else:
            scales = np.arange(previous_scale - 0.06, previous_scale + 0.061, 0.01)
        score, match = search(gray, title_template, scales)
        if score < MIN_SCORE and previous_scale is not None:
            score, match = search(gray, title_template, np.arange(0.5, 1.8, 0.02))
        if score < MIN_SCORE and DAWN_ONLY_WINDOW[0] <= seconds <= DAWN_ONLY_WINDOW[1]:
            dawn_score, dawn_match = search(gray, dawn_template, np.arange(0.5, 1.8, 0.02))
            if dawn_score >= MIN_SCORE + 0.08:
                score = dawn_score
                match = (dawn_match[0] - DAWN_OFFSET_X * dawn_match[2], dawn_match[1], dawn_match[2])
        if score >= MIN_SCORE:
            matches[index] = match
            previous_scale = match[2]
        else:
            previous_scale = None

    boxes_by_frame = {}
    window_frames = [
        index
        for a, b in WINDOWS
        for index in range(round(a * FRAMES_PER_SECOND), round(b * FRAMES_PER_SECOND) + 1)
    ]
    for index in window_frames:
        match = matches.get(index)
        if match is None:
            for distance in range(1, MAX_BORROW_FRAMES + 1):
                match = matches.get(index - distance) or matches.get(index + distance)
                if match is not None:
                    break
        if match is None:
            continue
        origin_x, origin_y, scale = match
        seconds = frame_seconds(index)
        boxes = []
        for (box_x, box_y, box_width, box_height), times in BOX_KINDS.values():
            if not in_window(seconds, times):
                continue
            boxes.append(
                (
                    round(origin_x + box_x * scale),
                    round(origin_y + box_y * scale),
                    round(box_width * scale),
                    round(box_height * scale),
                )
            )
        if boxes:
            boxes_by_frame[index] = boxes

    lines = [
        "// Generated by scripts/track-pass-mint-redactions.py: never edit by hand.",
        "// Blur boxes over Yash's email and the browser's autofill list, per recording frame (60 fps),",
        "// as [x, y, width, height] in the recording's pixels (1920 × 1080).",
        "",
        "export type RedactionBox = readonly [number, number, number, number]",
        "",
        "export const redactionBoxesByRecordingFrame: Readonly<Record<number, readonly RedactionBox[]>> = {",
    ]
    for index in sorted(boxes_by_frame):
        boxes = ", ".join(f"[{a}, {b}, {c}, {d}]" for a, b, c, d in boxes_by_frame[index])
        lines.append(f"  {index}: [{boxes}],")
    lines.append("}")
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text("\n".join(lines) + "\n")
    tracked = sum(1 for index in window_frames if index in matches)
    print(f"Tracked the title on {tracked} of {len(window_frames)} frames; wrote {OUTPUT_FILE}.")


if __name__ == "__main__":
    main()
