"""
TTS (Text-to-Speech) 라우터
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import base64

from app.services.tts_service import ElevenLabsTTSService
from app.services.r2_storage import get_r2_service


router = APIRouter(prefix="/api", tags=["tts"])


class ScriptItem(BaseModel):
    slideId: str
    slideNumber: int
    scriptText: str
    duration: Optional[float] = None


class GenerateTtsRequest(BaseModel):
    projectId: str
    scripts: List[ScriptItem]
    voiceId: Optional[str] = None
    voiceName: Optional[str] = None
    speed: Optional[float] = Field(default=1.0, ge=0.5, le=2.0)


class AudioItem(BaseModel):
    slideId: str
    slideNumber: int
    audioUrl: str
    duration: float


class GenerateTtsResponse(BaseModel):
    projectId: str
    audioUrls: List[AudioItem]
    totalDuration: float
    generatedAt: str


def _resolve_voice_id(voice_id: Optional[str], voice_name: Optional[str]) -> str:
    """voiceId 또는 voiceName을 ElevenLabs voice_id로 변환"""
    options = ElevenLabsTTSService.get_voice_options()

    if voice_id:
        # 사전 정의된 키이면 매핑
        if voice_id in options:
            return options[voice_id]["voice_id"]
        # 직접 입력된 voice_id일 수 있음
        return voice_id

    if voice_name:
        for _, info in options.items():
            if info.get("name") == voice_name:
                return info["voice_id"]

    # 기본 음성
    return options["male_professional_kr"]["voice_id"]


@router.post("/generate-tts")
async def generate_tts(request: GenerateTtsRequest) -> JSONResponse:
    """
    TTS 음성 합성 엔드포인트

    슬라이드 스크립트를 받아 ElevenLabs TTS로 음성을 생성합니다.
    """
    try:
        if not request.projectId:
            raise HTTPException(status_code=400, detail="projectId가 필요합니다")
        if not request.scripts or len(request.scripts) == 0:
            raise HTTPException(status_code=400, detail="최소 1개 이상의 스크립트가 필요합니다")

        voice_id = _resolve_voice_id(request.voiceId, request.voiceName)
        service = ElevenLabsTTSService()

        # R2 사용 가능 여부 확인
        r2_service = None
        try:
            r2_service = get_r2_service()
        except Exception:
            r2_service = None

        audio_items: List[AudioItem] = []
        total_duration = 0.0

        for script in request.scripts:
            audio_data = service.synthesize_speech(
                text=script.scriptText,
                voice_id=voice_id,
                speed=request.speed or 1.0,
            )

            if not audio_data:
                raise HTTPException(
                    status_code=500,
                    detail=f"TTS 생성 실패: slide {script.slideNumber}",
                )

            duration = script.duration or service.estimate_duration(script.scriptText)
            total_duration += duration

            # R2 업로드 또는 data URL 반환
            audio_url = ""
            if r2_service:
                file_key = f"projects/{request.projectId}/audio/slide_{script.slideNumber}.mp3"
                audio_url = r2_service.upload_file(audio_data, file_key, "audio/mpeg") or ""

            if not audio_url:
                # R2 미사용 시 data URL fallback
                b64 = base64.b64encode(audio_data).decode("utf-8")
                audio_url = f"data:audio/mpeg;base64,{b64}"

            audio_items.append(
                AudioItem(
                    slideId=script.slideId,
                    slideNumber=script.slideNumber,
                    audioUrl=audio_url,
                    duration=duration,
                )
            )

        response = GenerateTtsResponse(
            projectId=request.projectId,
            audioUrls=audio_items,
            totalDuration=total_duration,
            generatedAt=datetime.utcnow().isoformat(),
        )

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": response.model_dump(),
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={
                "success": False,
                "error": {
                    "code": "TTS_GENERATION_ERROR",
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


@router.get("/tts/voices")
async def get_voices() -> JSONResponse:
    """사용 가능한 음성 목록 반환"""
    try:
        voices = ElevenLabsTTSService.get_voice_options()
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": {
                    "voices": [
                        {
                            "id": key,
                            **info,
                        }
                        for key, info in voices.items()
                    ],
                    "total": len(voices),
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


@router.post("/tts-preview")
async def preview_tts(
    text: str,
    voiceId: str = "professional-male-korean",
):
    """
    TTS 미리듣기 (스트리밍)
    """
    try:
        if not text or len(text) > 1000:
            raise HTTPException(
                status_code=400,
                detail="텍스트는 1-1000자 사이여야 합니다"
            )
        
        tts_service = ElevenLabsTTSService()
        audio_data = tts_service.synthesize_speech(
            text=text,
            voice_id=voiceId,
        )
        
        if not audio_data:
            raise HTTPException(
                status_code=500,
                detail="음성 생성에 실패했습니다"
            )
        
        return StreamingResponse(
            iter([audio_data]),
            media_type="audio/mpeg",
        )
    
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={
                "success": False,
                "error": {
                    "code": "TTS_PREVIEW_ERROR",
                    "message": e.detail,
                },
            }
        )
