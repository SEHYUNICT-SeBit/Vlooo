"""
AI 스크립트 생성 라우터
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from app.services.script_generator import generate_scripts
from app.models import SlideModel


router = APIRouter(prefix="/api", tags=["script"])


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
        print(f"[SCRIPT_GENERATION] 시작: {request.projectId} ({len(slide_data)}개 슬라이드)")
        scripts = generate_scripts(
            slides=slide_data,
            tone=request.toneOfVoice,
            language=request.language,
        )
        
        # 전체 시간 계산
        total_duration = sum(s.get("duration", 0) for s in scripts)
        
        # 응답 생성
        from datetime import datetime
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
        
        print(f"[SCRIPT_GENERATION] 완료: {total_duration}초")
        
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
        print(f"[SCRIPT_GENERATION_ERROR] {str(e)}")
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
