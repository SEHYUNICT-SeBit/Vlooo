"""
AI 스크립트 생성 라우터
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
import asyncio
from app.services.script_generator import generate_scripts
from app.models import SlideModel
from datetime import datetime


router = APIRouter(prefix="/api", tags=["script"])


def _log(level: str, step: str, message: str):
    timestamp = datetime.utcnow().isoformat()
    print(f"[{timestamp}] [SCRIPT] [{level}] [{step}] {message}")


class GenerateScriptRequest(BaseModel):
    """스크립트 생성 요청"""
    projectId: str
    slides: List[SlideModel]
    toneOfVoice: Optional[str] = Field(default="professional")
    language: Optional[str] = Field(default="ko")
    customInstructions: Optional[str] = None


class GeneratedScript(BaseModel):
    """생성된 스크립트"""
    slideId: str
    slideNumber: int
    scriptText: str
    duration: Optional[int] = None
    keywords: Optional[List[str]] = None


class GenerateScriptResponse(BaseModel):
    """스크립트 생성 응답"""
    projectId: str
    scripts: List[GeneratedScript]
    totalDuration: Optional[int] = None
    generatedAt: str


@router.post("/generate-script")
async def generate_script(request: GenerateScriptRequest) -> JSONResponse:
    """
    AI 스크립트 생성 엔드포인트
    
    슬라이드 정보를 받아 IT 전문가 톤의 나레이션 스크립트를 생성합니다.
    """
    try:
        # 입력 검증
        if not request.projectId:
            raise HTTPException(status_code=400, detail="projectId가 필요합니다")
        
        if not request.slides or len(request.slides) == 0:
            raise HTTPException(status_code=400, detail="최소 1개 이상의 슬라이드가 필요합니다")
        
        # 이미 완료된 단계인지 체크 (재개 로직)
        from main import get_stage_result
        cached_result = get_stage_result(request.projectId, "scripting")
        if cached_result and cached_result.get("status") == "completed":
            _log("MINOR", "CACHE_HIT", f"projectId={request.projectId} - using cached scripts")
            cached_data = cached_result.get("data", {})
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "data": cached_data,
                    "cached": True,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
        
        # 톤 검증
        valid_tones = ["professional", "friendly", "casual"]
        if request.toneOfVoice not in valid_tones:
            raise HTTPException(
                status_code=400,
                detail=f"유효하지 않은 톤입니다. {', '.join(valid_tones)} 중 선택해주세요"
            )
        
        # 언어 검증
        valid_languages = ["ko", "en"]
        if request.language not in valid_languages:
            raise HTTPException(
                status_code=400,
                detail=f"유효하지 않은 언어입니다. {', '.join(valid_languages)} 중 선택해주세요"
            )
        
        # 슬라이드 데이터 변환 (Pydantic 모델 -> Dictionary)
        slide_data = [
            {
                "slideId": slide.slideId,
                "slideNumber": slide.slideNumber,
                "title": slide.title or f"Slide {slide.slideNumber}",
                "content": slide.content,
            }
            for slide in request.slides
        ]
        
        # 스크립트 생성
        _log("MINOR", "START", f"projectId={request.projectId} slides={len(slide_data)}")
        
        # 진행 상태 업데이트
        from main import update_project_progress
        
        scripts = []
        for idx, slide in enumerate(slide_data, 1):
            # 진행 상태 업데이트
            update_project_progress(
                request.projectId,
                "scripting",
                current=idx,
                total=len(slide_data),
                details=f"슬라이드 {idx}/{len(slide_data)} 처리 중..."
            )
            
            # 개별 슬라이드 스크립트 생성
            script_result = await asyncio.to_thread(
                generate_scripts,
                slides=[slide],
                tone=request.toneOfVoice,
                language=request.language,
            )
            scripts.extend(script_result)
            
            _log("MINOR", f"SLIDE_{idx}", f"{idx}/{len(slide_data)} 완료")
        
        # 전체 시간 계산
        total_duration = sum(s.get("duration", 0) for s in scripts)
        
        # 응답 생성
        response = GenerateScriptResponse(
            projectId=request.projectId,
            scripts=[
                GeneratedScript(
                    slideId=s["slideId"],
                    slideNumber=s["slideNumber"],
                    scriptText=s["scriptText"],
                    duration=s.get("duration"),
                    keywords=s.get("keywords"),
                )
                for s in scripts
            ],
            totalDuration=total_duration,
            generatedAt=datetime.utcnow().isoformat(),
        )
        
        # 스크립트 생성 결과 저장 (재개 시 사용)
        from main import save_stage_result
        save_stage_result(
            request.projectId,
            "scripting",
            "completed",
            data=response.model_dump()
        )
        
        _log("MAJOR", "DONE", f"duration={total_duration}s")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": response.model_dump(),
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
    
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={
                "success": False,
                "error": {
                    "code": "SCRIPT_GENERATION_ERROR",
                    "message": e.detail,
                },
                "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
            }
        )
    
    except Exception as e:
        _log("CRITICAL", "ERROR", str(e))
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "스크립트 생성 중 오류가 발생했습니다",
                },
                "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
            }
        )
