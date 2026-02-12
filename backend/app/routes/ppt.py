"""
PPT 파싱 라우터
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import uuid
from app.services.ppt_parser import parse_ppt_file
from app.models import ParsePptResponse, SlideModel, MetadataModel
from datetime import datetime


router = APIRouter(prefix="/api", tags=["ppt"])


def _log(level: str, step: str, message: str):
    timestamp = datetime.utcnow().isoformat()
    print(f"[{timestamp}] [PPT] [{level}] [{step}] {message}")


@router.post("/parse-ppt")
async def parse_ppt(file: UploadFile = File(...)) -> JSONResponse:
    """
    PPT 파일 파싱 엔드포인트
    
    파일을 업로드하면 슬라이드, 텍스트, 이미지를 추출합니다.
    """
    try:
        _log("MINOR", "START", f"filename={file.filename or 'unknown'}")

        # 파일 타입 검증
        if not file.filename:
            raise HTTPException(status_code=400, detail="파일명이 없습니다")
        
        if not file.filename.lower().endswith((".ppt", ".pptx")):
            raise HTTPException(
                status_code=400,
                detail="PPT 파일만 업로드 가능합니다"
            )
        
        # 파일 읽기
        file_content = await file.read()
        
        # 파일 크기 검증 (100MB)
        max_size = 100 * 1024 * 1024
        if len(file_content) > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"파일이 너무 큽니다 (최대 {max_size / 1024 / 1024}MB)"
            )
        
        # 프로젝트 ID 생성 (파싱 전에 생성하여 진행도 추적 가능)
        project_id = f"proj_{uuid.uuid4().hex[:12]}"
        
        # 진행 상태 업데이트
        from main import update_project_progress
        update_project_progress(
            project_id,
            "parsing",
            current=0,
            total=1,
            details="PPT 파일 분석 중..."
        )
        
        # PPT 파싱
        parse_result = parse_ppt_file(file_content)
        
        if not parse_result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=f"PPT 파싱 실패: {parse_result.get('error', 'Unknown error')}"
            )
        
        # 슬라이드 모델 생성
        slides = [
            SlideModel(
                slideId=s["slideId"],
                slideNumber=s["slideNumber"],
                title=s.get("title"),
                content=s.get("content", ""),
                imageUrls=s.get("imageUrls", []),
                notes=s.get("notes"),
            )
            for s in parse_result.get("slides", [])
        ]
        
        # 파싱 완료 상태 업데이트
        update_project_progress(
            project_id,
            "parsing",
            current=len(slides),
            total=len(slides),
            details=f"PPT 분석 완료 ({len(slides)}개 슬라이드)"
        )
        
        # 메타데이터 모델 생성
        metadata = MetadataModel(
            **parse_result.get("metadata", {})
        )
        
        # 응답 생성
        response = ParsePptResponse(
            projectId=project_id,
            totalSlides=len(slides),
            slides=slides,
            extractedText=parse_result.get("extracted_text", ""),
            metadata=metadata,
        )
        
        # 파싱 결과 저장 (재개 시 사용)
        from main import save_stage_result
        save_stage_result(
            project_id,
            "parsing",
            "completed",
            data=response.model_dump()
        )
        
        _log("MAJOR", "DONE", f"projectId={project_id} slides={len(slides)}")

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": response.model_dump(),
                "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
            }
        )
    
    except HTTPException as e:
        _log("CRITICAL", "ERROR", str(e.detail))
        return JSONResponse(
            status_code=e.status_code,
            content={
                "success": False,
                "error": {
                    "code": "PPT_PARSE_ERROR",
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
                    "message": str(e),
                },
                "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
            }
        )


@router.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "service": "ppt-parser",
        "version": "1.0.0",
    }
