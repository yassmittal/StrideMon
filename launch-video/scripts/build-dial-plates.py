"""The Dial film's clean plates, from the reference (../iphone.mp4).

Run from launch-video/:

    uv run --no-project --python 3.11 --with onnxruntime --with pillow --with numpy \
      python scripts/build-dial-plates.py

`uv` builds a throwaway environment, so nothing is installed in the repo. It needs ffmpeg and curl.

The film keeps the reference's ten café shots and swaps each cake for a Sneaker
(docs/dial-video-prompt.md). Each shot needs the reference's own background without the cake, its
plate and the burnt-in caption: one frame per shot, inpainted with LaMa (big-lama, Apache 2.0, the
ONNX export at huggingface.co/Carve/LaMa-ONNX, the same file the Crush film's script downloads into
out/work/crush/). The model runs on a crop around the hole and only the hole is pasted back. Plates
go to public/dial/plates/<shot>.png (gitignored). The shots barely move, so there are no tracks: the
film's own slow push-in keeps them alive.
"""

import subprocess
from pathlib import Path

import numpy as np
import onnxruntime
from PIL import Image, ImageDraw, ImageFilter

REFERENCE_PATH = Path("../iphone.mp4")
WORK_DIRECTORY = Path("out/work/dial")
FRAMES_DIRECTORY = WORK_DIRECTORY / "frames"
MODEL_PATH = Path("out/work/crush/lama_fp32.onnx")
MODEL_URL = "https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx"
PLATES_DIRECTORY = Path("public/dial/plates")
MODEL_SIZE = 512
CROP_MARGIN_PIXELS = 140

# The caption ("①" over `Cake "Honey Cake"`), burnt in at the same place in every shot.
CAPTION_REGION = ("rect", 40, 175, 680, 318)

# The plates: shot -> (reference frame, the cake and its plate, in the reference's 720 x 1280
# pixels). Read off grids drawn on each frame. The Napoleon's wooden board stays: its Sneaker
# stands on it.
PLATES: dict[str, tuple[int, tuple]] = {
    "honey": (120, ("rect", 30, 520, 680, 895)),
    "redVelvet": (140, ("rect", 0, 640, 720, 1060)),
    "napoleon": (156, ("rect", 70, 455, 700, 812)),
    "cloud": (174, ("rect", 0, 700, 720, 1015)),
    "blackForest": (192, ("rect", 0, 600, 720, 1095)),
    "redBerry": (211, ("rect", 55, 565, 705, 895)),
    "caramel": (229, ("rect", 0, 440, 720, 905)),
    "strawberry": (247, ("rect", 55, 585, 665, 945)),
    "carrot": (267, ("rect", 0, 720, 720, 1250)),
    "cheesecake": (282, ("rect", 25, 545, 705, 885)),
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


def draw_region(size: tuple[int, int], region: tuple) -> Image.Image:
    mask = Image.new("L", size, 0)
    _kind, *values = region
    ImageDraw.Draw(mask).rectangle(values, fill=255)
    return mask


def inpaint(session: onnxruntime.InferenceSession, image: Image.Image, region: tuple) -> Image.Image:
    mask = draw_region(image.size, region).filter(ImageFilter.MaxFilter(9))
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


def build_plates() -> None:
    PLATES_DIRECTORY.mkdir(parents=True, exist_ok=True)
    session = onnxruntime.InferenceSession(str(MODEL_PATH), providers=["CPUExecutionProvider"])
    for name, (frame, cake_region) in PLATES.items():
        image = Image.open(FRAMES_DIRECTORY / f"{frame:04d}.png").convert("RGB")
        # The caption first, on its own: a separate small hole fills more cleanly than one big one.
        plate = inpaint(session, inpaint(session, image, CAPTION_REGION), cake_region)
        plate.save(PLATES_DIRECTORY / f"{name}.png")
        print(f"plate {name}: frame {frame}")


def main() -> None:
    WORK_DIRECTORY.mkdir(parents=True, exist_ok=True)
    extract_frames()
    download_model()
    build_plates()


if __name__ == "__main__":
    main()
