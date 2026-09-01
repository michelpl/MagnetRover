"""
Build a 16-direction rover spritesheet from the existing 8-direction PNGs.

Used when Blender is unavailable. Intermediate facings blend adjacent 8-dir frames.
Run:
  python tools/blender/pack_rover_16_from_8.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = REPO_ROOT / "public" / "assets" / "sprites" / "rover"
FRAME_SIZE = 256

NAMES_8 = ("n", "ne", "e", "se", "s", "sw", "w", "nw")
NAMES_16 = (
    "n",
    "nne",
    "ne",
    "ene",
    "e",
    "ese",
    "se",
    "sse",
    "s",
    "ssw",
    "sw",
    "wsw",
    "w",
    "wnw",
    "nw",
    "nnw",
)


def load_8_dir_frames() -> list[Image.Image]:
    frames: list[Image.Image] = []
    for name in NAMES_8:
        path = OUTPUT_DIR / f"rover_{name}.png"
        if not path.is_file():
            raise FileNotFoundError(path)
        image = Image.open(path).convert("RGBA")
        if image.size != (FRAME_SIZE, FRAME_SIZE):
            image = image.resize((FRAME_SIZE, FRAME_SIZE), Image.Resampling.LANCZOS)
        frames.append(image)
    return frames


def frame_at_16_index(frames_8: list[Image.Image], index: int) -> Image.Image:
    position = index / 2.0
    lo = int(position) % 8
    hi = (lo + 1) % 8
    blend = position - int(position)
    if blend < 0.001:
        return frames_8[lo].copy()
    return Image.blend(frames_8[lo], frames_8[hi], blend)


def main() -> None:
    frames_8 = load_8_dir_frames()
    frames_16: list[Image.Image] = []

    for index, name in enumerate(NAMES_16):
        frame = frame_at_16_index(frames_8, index)
        frames_16.append(frame)
        out = OUTPUT_DIR / f"rover_{name}.png"
        frame.save(out)
        print(f"Wrote {out.name}")

    sheet = Image.new("RGBA", (FRAME_SIZE * 16, FRAME_SIZE))
    for index, frame in enumerate(frames_16):
        sheet.paste(frame, (index * FRAME_SIZE, 0))

    sheet_path = OUTPUT_DIR / "rover.png"
    sheet.save(sheet_path)
    print(f"Spritesheet {sheet_path} ({sheet.size[0]}x{sheet.size[1]})")


if __name__ == "__main__":
    main()
