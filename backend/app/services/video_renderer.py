"""
FFmpeg 기반 비디오 렌더링 서비스
"""

import base64
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, List, Tuple, Optional

import requests
from PIL import Image, ImageDraw, ImageFont


def _resolution_to_size(resolution: str) -> Tuple[int, int]:
    if resolution == "720p":
        return (1280, 720)
    if resolution == "4k":
        return (3840, 2160)
    return (1920, 1080)


def _read_bytes_from_url(url: str) -> bytes:
    if url.startswith("data:"):
        header, b64_data = url.split(",", 1)
        return base64.b64decode(b64_data)
    if url.startswith("http://") or url.startswith("https://"):
        resp = requests.get(url, timeout=60)
        resp.raise_for_status()
        return resp.content
    if url.startswith("file://"):
        return Path(url[7:]).read_bytes()
    return Path(url).read_bytes()


def _download_to_path(url: str, dest_path: Path) -> None:
    data = _read_bytes_from_url(url)
    dest_path.write_bytes(data)


def _create_placeholder_image(path: Path, width: int, height: int, title: str) -> None:
    image = Image.new("RGB", (width, height), color=(15, 23, 42))
    draw = ImageDraw.Draw(image)

    text = title.strip() if title else "Slide"
    font = ImageFont.load_default()
    bbox = font.getbbox(text)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = max((width - text_width) // 2, 20)
    y = max((height - text_height) // 2, 20)

    draw.text((x, y), text, fill=(226, 232, 240), font=font)
    image.save(path, format="PNG")


def _write_concat_file(items: List[Tuple[Path, float]], list_path: Path) -> None:
    lines = []
    for item_path, duration in items:
        lines.append(f"file '{item_path.as_posix()}'")
        lines.append(f"duration {duration}")

    if items:
        lines.append(f"file '{items[-1][0].as_posix()}'")

    list_path.write_text("\n".join(lines), encoding="utf-8")


def _resolve_ffmpeg() -> str:
    ffmpeg_path = os.getenv("FFMPEG_PATH")
    if ffmpeg_path:
        return ffmpeg_path
    resolved = shutil.which("ffmpeg")
    if resolved:
        return resolved
    raise FileNotFoundError(
        "FFmpeg executable not found. Install FFmpeg or set FFMPEG_PATH."
    )


def _run_ffmpeg(args: List[str]) -> None:
    args = args.copy()
    args[0] = _resolve_ffmpeg()
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg 오류: {result.stderr.strip()}")


def render_video(
    project_id: str,
    slides: List[Dict[str, object]],
    audio_urls: List[Dict[str, object]],
    resolution: str = "1080p",
    fps: int = 30,
    output_format: str = "mp4",
) -> Dict[str, object]:
    """
    슬라이드 이미지 + 오디오를 합성하여 비디오 생성
    """
    width, height = _resolution_to_size(resolution)

    work_dir = Path(tempfile.mkdtemp(prefix="vlooo_render_"))
    images_dir = work_dir / "images"
    audio_dir = work_dir / "audio"
    images_dir.mkdir(parents=True, exist_ok=True)
    audio_dir.mkdir(parents=True, exist_ok=True)

    audio_map = {item.get("slideNumber"): item for item in audio_urls}
    slide_items: List[Tuple[Path, float]] = []
    audio_items: List[Tuple[Path, float]] = []

    for slide in slides:
        slide_number = int(slide.get("slideNumber", 1))
        title = str(slide.get("title", ""))
        image_urls = slide.get("imageUrls") or []
        image_path = images_dir / f"slide_{slide_number}.png"

        if image_urls:
            _download_to_path(str(image_urls[0]), image_path)
        else:
            _create_placeholder_image(image_path, width, height, title)

        audio_info = audio_map.get(slide_number)
        duration = float(audio_info.get("duration", 5)) if audio_info else 5.0

        slide_items.append((image_path, duration))

        if audio_info:
            audio_path = audio_dir / f"slide_{slide_number}.mp3"
            _download_to_path(str(audio_info.get("audioUrl", "")), audio_path)
            audio_items.append((audio_path, duration))

    # 이미지 슬라이드 비디오 생성
    images_list = work_dir / "images.txt"
    _write_concat_file(slide_items, images_list)
    slides_video = work_dir / "slides.mp4"

    _run_ffmpeg([
        "ffmpeg",
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(images_list),
        "-r",
        str(fps),
        "-pix_fmt",
        "yuv420p",
        str(slides_video),
    ])

    # 오디오 합성
    audio_list = work_dir / "audio.txt"
    _write_concat_file(audio_items, audio_list)
    audio_track = work_dir / "audio.m4a"

    _run_ffmpeg([
        "ffmpeg",
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(audio_list),
        "-c:a",
        "aac",
        str(audio_track),
    ])

    # 최종 합성
    output_path = work_dir / f"{project_id}_final.{output_format}"
    video_codec_args = ["-c:v", "copy"]
    audio_codec_args = ["-c:a", "aac"]

    if output_format == "webm":
        video_codec_args = ["-c:v", "libvpx"]
        audio_codec_args = ["-c:a", "libopus"]

    _run_ffmpeg([
        "ffmpeg",
        "-y",
        "-i",
        str(slides_video),
        "-i",
        str(audio_track),
        *video_codec_args,
        *audio_codec_args,
        "-shortest",
        str(output_path),
    ])

    total_duration = sum([duration for _, duration in slide_items])
    return {
        "output_path": str(output_path),
        "duration": total_duration,
        "resolution": resolution,
        "video_size": output_path.stat().st_size if output_path.exists() else 0,
    }