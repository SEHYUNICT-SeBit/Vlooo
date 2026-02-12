"""
Vlooo FastAPI 백엔드 메인 애플리케이션
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv
from pathlib import Path
import subprocess
import time
import requests
from contextlib import asynccontextmanager

# 환경 변수 로드 (프로젝트 루트의 .env.local 파일 로드)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = PROJECT_ROOT / ".env.local"
load_dotenv(dotenv_path=str(ENV_FILE))

# 기본 디렉터리 설정
BASE_DIR = Path(__file__).resolve().parent
MEDIA_DIR = Path(os.getenv("MEDIA_DIR", str(BASE_DIR / "media")))
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

# ============ Ollama 자동 시작 ============
ollama_process = None

def start_ollama():
    """Ollama 서비스 자동 시작"""
    global ollama_process
    try:
        # URL로 Ollama 헬스 체크
        ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        try:
            response = requests.get(f"{ollama_url}/api/tags", timeout=2)
            if response.status_code == 200:
                import sys
                timestamp = time.strftime("%H:%M:%S")
                print(f"[{timestamp}] [MINOR] [OLLAMA] OK - Ollama is already running", file=sys.stdout, flush=True)
                return True
        except:
            pass
        
        # Ollama 프로세스 시작
        import sys
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] [MINOR] [OLLAMA] Starting Ollama service...", file=sys.stdout, flush=True)
        ollama_process = subprocess.Popen(
            ["ollama", "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        
        # Ollama 시작 대기 (최대 30초)
        for i in range(30):
            try:
                response = requests.get(f"{ollama_url}/api/tags", timeout=2)
                if response.status_code == 200:
                    import sys
                    timestamp = time.strftime("%H:%M:%S")
                    print(f"[{timestamp}] [MAJOR] [OLLAMA] OK - Ollama started successfully", file=sys.stdout, flush=True)
                    return True
            except:
                pass
            time.sleep(1)
        
        import sys
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] [WARNING] [OLLAMA] WARN - Ollama startup timeout - may need manual start", file=sys.stdout, flush=True)
        return False
    
    except FileNotFoundError:
        import sys
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] [CRITICAL] [OLLAMA] ERROR - Ollama not found in PATH - please install Ollama first", file=sys.stdout, flush=True)
        return False
    except Exception as e:
        import sys
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] [WARNING] [OLLAMA] WARN - Could not auto-start Ollama: {e}", file=sys.stdout, flush=True)
        return False

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI 라이프사이클 - 앱 시작/종료"""
    # 시작할 때
    start_ollama()
    yield
    # 종료할 때
    if ollama_process:
        import sys
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] [MINOR] [OLLAMA] Stopping Ollama...", file=sys.stdout, flush=True)
        ollama_process.terminate()

# ============ 프로젝트 상태 추적 ============
# 프로젝트별 진행 상태를 저장하는 글로벌 딕셔너리
project_progress = {}

# 프로젝트 체크포인트 저장 디렉터리
CHECKPOINT_DIR = MEDIA_DIR / "checkpoints"
CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

import json
from typing import Optional, Dict, Any

def get_checkpoint_path(project_id: str) -> Path:
    """프로젝트 체크포인트 파일 경로 반환"""
    return CHECKPOINT_DIR / f"{project_id}.json"

def save_checkpoint(project_id: str):
    """현재 프로젝트 상태를 파일로 저장 (서버 재시작 대비)"""
    try:
        checkpoint_path = get_checkpoint_path(project_id)
        data = project_progress.get(project_id, {})
        with open(checkpoint_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[WARN] Failed to save checkpoint for {project_id}: {e}")

def load_checkpoint(project_id: str) -> Optional[Dict[str, Any]]:
    """파일에서 프로젝트 상태 복구"""
    try:
        checkpoint_path = get_checkpoint_path(project_id)
        if checkpoint_path.exists():
            with open(checkpoint_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                project_progress[project_id] = data
                print(f"[INFO] Loaded checkpoint for {project_id}")
                return data
    except Exception as e:
        print(f"[WARN] Failed to load checkpoint for {project_id}: {e}")
    return None

def delete_checkpoint(project_id: str):
    """프로젝트 체크포인트 삭제 (사용자가 명시적으로 취소한 경우)"""
    try:
        checkpoint_path = get_checkpoint_path(project_id)
        if checkpoint_path.exists():
            checkpoint_path.unlink()
            print(f"[INFO] Deleted checkpoint for {project_id}")
        if project_id in project_progress:
            del project_progress[project_id]
    except Exception as e:
        print(f"[WARN] Failed to delete checkpoint for {project_id}: {e}")

def update_project_progress(project_id: str, stage: str, current: int = 0, total: int = 0, details: str = ""):
    """프로젝트 진행 상태 업데이트"""
    if project_id not in project_progress:
        project_progress[project_id] = {
            "projectId": project_id,
            "stage": stage,
            "status": "pending",  # pending, in-progress, completed, failed
            "results": {}  # 각 단계별 결과 저장
        }
    
    project_progress[project_id].update({
        "stage": stage,
        "current": current,
        "total": total,
        "details": details,
        "timestamp": __import__('datetime').datetime.utcnow().isoformat(),
    })
    
    # 진행 상황을 파일로 저장 (서버 재시작 대비)
    save_checkpoint(project_id)

def save_stage_result(project_id: str, stage: str, status: str, data: Any = None, error: str = ""):
    """
    단계별 결과 저장
    - stage: "parsing", "scripting", "voice-synthesis", "rendering"
    - status: "completed", "failed", "partial"
    - data: 단계 결과 데이터
    - error: 실패 시 에러 메시지
    """
    if project_id not in project_progress:
        project_progress[project_id] = {
            "projectId": project_id,
            "stage": stage,
            "status": status,
            "results": {}
        }
    
    project_progress[project_id]["results"][stage] = {
        "status": status,
        "data": data,
        "error": error,
        "completedAt": __import__('datetime').datetime.utcnow().isoformat(),
    }
    
    # 체크포인트 저장
    save_checkpoint(project_id)

def get_stage_result(project_id: str, stage: str) -> Optional[Dict[str, Any]]:
    """특정 단계의 결과 조회 (재개 시 사용)"""
    # 메모리에 없으면 파일에서 로드 시도
    if project_id not in project_progress:
        load_checkpoint(project_id)
    
    progress = project_progress.get(project_id, {})
    return progress.get("results", {}).get(stage)

def get_project_progress(project_id: str):
    """프로젝트 진행 상태 조회"""
    # 메모리에 없으면 파일에서 로드 시도
    if project_id not in project_progress:
        load_checkpoint(project_id)
    
    return project_progress.get(project_id, {})

# FastAPI 애플리케이션 생성
app = FastAPI(
    title="Vlooo Backend API",
    description="PPT를 영상으로 변환하는 AI 서비스 백엔드",
    version="1.0.0",
    lifespan=lifespan,
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

# 정적 파일 서빙 (렌더된 비디오)
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")


# --------------- 라우터 등록 ---------------
from app.routes.ppt import router as ppt_router
from app.routes.script import router as script_router
from app.routes.tts import router as tts_router
from app.routes.render import router as render_router

app.include_router(ppt_router)
app.include_router(script_router)
app.include_router(tts_router)
app.include_router(render_router)


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
            "tts_generator": "ready",
            "video_renderer": "ready",
            "r2_storage": os.getenv("CLOUDFLARE_R2_ENDPOINT") is not None,
        },
    }


@app.get("/api/project-status/{project_id}")
async def get_project_status(project_id: str):
    """프로젝트 진행 상태 조회"""
    # 메모리에 없으면 checkpoint에서 로드
    if project_id not in project_progress:
        load_checkpoint(project_id)
    
    progress = get_project_progress(project_id)
    if not progress:
        return {
            "projectId": project_id,
            "stage": "unknown",
            "current": 0,
            "total": 0,
            "details": "상태 정보 없음",
        }
    result = {
        "projectId": project_id,
        "stage": progress.get("stage", "unknown"),
        "current": progress.get("current", 0),
        "total": progress.get("total", 0),
        "details": progress.get("details", ""),
        "timestamp": progress.get("timestamp", ""),
        "status": progress.get("status", "pending"),
        "results": progress.get("results", {}),  # 각 단계별 완료 상태
    }
    return result


@app.delete("/api/project/{project_id}")
async def cancel_project(project_id: str):
    """
    프로젝트 취소 및 체크포인트 삭제
    사용자가 명시적으로 X 버튼을 눌러 취소한 경우 호출
    """
    delete_checkpoint(project_id)
    return {
        "success": True,
        "message": f"프로젝트 {project_id} 취소 및 이력 삭제 완료",
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
        access_log=True,  # 임시로 다시 켜기
    )
