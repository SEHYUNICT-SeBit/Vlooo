"""
Vlooo FastAPI 백엔드 메인 애플리케이션
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# FastAPI 애플리케이션 생성
app = FastAPI(
    title="Vlooo Backend API",
    description="PPT를 영상으로 변환하는 AI 서비스 백엔드",
    version="1.0.0",
)

# CORS 설정 (Next.js와의 통신 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------- 라우터 등록 ---------------
from app.routes.ppt import router as ppt_router
from app.routes.script import router as script_router

app.include_router(ppt_router)
app.include_router(script_router)


# --------------- 기본 엔드포인트 ---------------
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Vlooo Backend API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/api/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "service": "vlooo-backend",
        "version": "1.0.0",
    }


@app.get("/api/status")
async def api_status():
    """API 상태 조회"""
    return {
        "status": "operational",
        "environment": os.getenv("FASTAPI_ENV", "production"),
        "services": {
            "ppt_parser": "ready",
            "script_generator": "ready",
            "r2_storage": os.getenv("CLOUDFLARE_R2_ENDPOINT") is not None,
        },
    }


# --------------- 에러 핸들러 ---------------
@app.exception_handler(404)
async def not_found(request, exc):
    """404 에러 핸들러"""
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": {
                "code": "NOT_FOUND",
                "message": "요청한 엔드포인트를 찾을 수 없습니다",
            },
        },
    )


@app.exception_handler(500)
async def internal_error(request, exc):
    """500 에러 핸들러"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "서버 내부 오류가 발생했습니다",
            },
        },
    )


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("FASTAPI_PORT", 8000))
    debug = os.getenv("FASTAPI_DEBUG", "false").lower() == "true"
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=debug,
    )
