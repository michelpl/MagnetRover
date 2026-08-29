"""Mux rover drop PNG frames into GIF and MJPEG AVI (no FFmpeg required)."""

from __future__ import annotations

import struct
import sys
from io import BytesIO
from pathlib import Path

from PIL import Image

FPS = 24


def write_mjpeg_avi(frame_paths: list[Path], dest: Path, fps: int) -> None:
    jpegs: list[bytes] = []
    width = height = 0
    for path in frame_paths:
        image = Image.open(path).convert("RGB")
        width, height = image.size
        buffer = BytesIO()
        image.save(buffer, format="JPEG", quality=78)
        data = buffer.getvalue()
        if len(data) % 2:
            data += b"\x00"
        jpegs.append(data)

    frame_count = len(jpegs)
    micro_per_frame = int(1_000_000 / fps)
    max_chunk = max((len(data) for data in jpegs), default=0)

    movi = bytearray(b"movi")
    offsets: list[tuple[int, int]] = []
    for data in jpegs:
        offsets.append((len(movi), len(data)))
        movi += b"00dc"
        movi += struct.pack("<I", len(data))
        movi += data

    avih = struct.pack(
        "<IIIIIIIIIIIIII",
        micro_per_frame,
        max(1, max_chunk * fps),
        0,
        0x10,
        frame_count,
        0,
        1,
        max_chunk,
        width,
        height,
        0,
        0,
        0,
        0,
    )
    strh = struct.pack(
        "<4s4sIHHIIIIIIII4H",
        b"vids",
        b"MJPG",
        0,
        0,
        0,
        0,
        1,
        fps,
        0,
        frame_count,
        max_chunk,
        0xFFFFFFFF,
        0,
        0,
        0,
        width,
        height,
    )
    strf = struct.pack(
        "<IiiHHIIiiII",
        40,
        width,
        height,
        1,
        24,
        0x47504A4D,
        jpegs[0] and len(jpegs[0]) or 0,
        0,
        0,
        0,
        0,
    )
    strl = b"strh" + struct.pack("<I", len(strh)) + strh
    strl += b"strf" + struct.pack("<I", len(strf)) + strf
    hdrl = b"avih" + struct.pack("<I", len(avih)) + avih
    hdrl += b"LIST" + struct.pack("<I", len(strl) + 4) + b"strl" + strl

    idx_body = bytearray()
    for offset, size in offsets:
        idx_body += struct.pack("<4sIII", b"00dc", 0x10, offset, size)
    idx = b"idx1" + struct.pack("<I", len(idx_body)) + idx_body

    hdrl_list = b"LIST" + struct.pack("<I", len(hdrl) + 4) + b"hdrl" + hdrl
    movi_list = b"LIST" + struct.pack("<I", len(movi)) + bytes(movi)
    riff_body = b"AVI " + hdrl_list + movi_list + idx
    dest.write_bytes(b"RIFF" + struct.pack("<I", len(riff_body)) + riff_body)


def main() -> None:
    frame_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    frames = sorted(frame_dir.glob("frame_*.png"))
    if not frames:
        raise FileNotFoundError(frame_dir)

    images = [Image.open(path).convert("RGB") for path in frames]
    gif_path = output_dir / "rover_drop_preview.gif"
    images[0].save(
        gif_path,
        save_all=True,
        append_images=images[1:],
        duration=int(round(1000 / FPS)),
        loop=0,
    )
    print(f"GIF {gif_path}")

    avi_path = output_dir / "rover_drop_preview.avi"
    write_mjpeg_avi(frames, avi_path, FPS)
    print(f"AVI {avi_path}")

    mp4_path = output_dir / "rover_drop_preview.mp4"
    if mp4_path.exists() and mp4_path.stat().st_size < 1024:
        mp4_path.unlink()
    try:
        import imageio.v2 as iio

        iio.mimsave(str(mp4_path), [iio.imread(path) for path in frames], format="FFMPEG", fps=FPS)
        print(f"MP4 {mp4_path}")
    except Exception as exc:
        print(f"MP4 skipped {exc}")
        if mp4_path.exists() and mp4_path.stat().st_size < 1024:
            mp4_path.unlink()


if __name__ == "__main__":
    main()
