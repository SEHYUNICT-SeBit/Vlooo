"""
비디오 렌더링 라우터
"""

import os
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.services.video_renderer import render_video
from app.services.r2_storage import get_r2_service


router = APIRouter(prefix="/api", tags=["render"])


class SlideItem(BaseModel):
    slideId: str
    slideNumber: int
    title: Optional[str] = None
    content: str
    imageUrls: List[str] = Field(default_factory=list)


class AudioItem(BaseModel):
    slideId: str
    slideNumber: int
    audioUrl: str
    duration: float


class RenderVideoRequest(BaseModel):
    projectId: str
    slides: List[SlideItem]
    audioUrls: List[AudioItem]
    resolution: Optional[str] = Field(default="1080p")
    fps: Optional[int] = Field(default=30)
    outputFormat: Optional[str] = Field(default="mp4")


@router.post("/render-video")
async def render_video_endpoint(request: RenderVideoRequest) -> JSONResponse:
    """
    비디오 렌더링 엔드포인트
    """
    try:
        if not request.projectId:
            raise HTTPException(status_code=400, detail="projectId가 필요합니다")
        if not request.slides or not request.audioUrls:
            raise HTTPException(status_code=400, detail="slides와 audioUrls가 필요합니다")
        if len(request.slides) != len(request.audioUrls):
            raise HTTPException(status_code=400, detail="slides와 audioUrls 개수가 일치하지 않습니다")

        result = render_video(
            project_id=request.projectId,
            slides=[s.model_dump() for s in request.slides],
            audio_urls=[a.model_dump() for a in request.audioUrls],
            resolution=request.resolution or "1080p",
            fps=request.fps or 30,
            output_format=request.outputFormat or "mp4",
        )

        output_path = Path(result.get("output_path", ""))
        if not output_path.exists():
            raise HTTPException(status_code=500, detail="렌더링 결과 파일을 찾을 수 없습니다")

        # R2 업로드 시도
        video_url = ""
        try:
            r2_service = get_r2_service()
            file_key = f"projects/{request.projectId}/video/final.{request.outputFormat}"\
                .replace("..", ".")
            video_url = r2_service.upload_file(
                output_path.read_bytes(),
                file_key,
                f"video/{request.outputFormat}",
            ) or ""
        except Exception:
            video_url = ""

        # 로컬 서빙 (R2 미사용 시)
        if not video_url:
            base_dir = Path(__file__).resolve().parents[2]
            media_dir = Path(os.getenv("MEDIA_DIR", str(base_dir / "media")))
            media_dir.mkdir(parents=True, exist_ok=True)

            target_path = media_dir / f"{request.projectId}_final.{request.outputFormat}"
            target_path.write_bytes(output_path.read_bytes())

            public_base = os.getenv("FASTAPI_PUBLIC_URL", "http://localhost:8000")
            video_url = f"{public_base}/media/{target_path.name}"

        response = {
            "projectId": request.projectId,
            "videoUrl": video_url,
            "videoSize": result.get("video_size", 0),
            "duration": result.get("duration", 0),
            "resolution": request.resolution or "1080p",
            "renderStatus": "completed",
            "completedAt": datetime.utcnow().isoformat(),
        }

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": response,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={
                "success": False,
                "error": {
                    "code": "VIDEO_RENDER_ERROR",
                    "message": e.detail,
                },
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": str(e),
                },
                "timestamp": datetime.utcnow().isoformat(),
            },
        )