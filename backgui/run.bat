@echo off
REM Vlooo 백엔드 모니터 - 실행 배치 파일
chcp 65001 >nul

echo.
echo ========================================
echo   🎬 Vlooo 백엔드 모니터 시작
echo ========================================
echo.

REM Python이 설치되어 있는지 확인
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python이 설치되어 있지 않습니다.
    echo    https://www.python.org/downloads/ 에서 설치하세요.
    pause
    exit /b 1
)

REM requests 패키지 확인 및 설치
python -c "import requests" >nul 2>&1
if errorlevel 1 (
    echo 📦 필요한 패키지 설치 중...
    pip install -q requests
)

REM GUI 실행
echo ✅ 모니터 시작 중...
echo.
python monitor.py

if errorlevel 1 (
    echo.
    echo ❌ 모니터 실행 중 오류가 발생했습니다.
    pause
    exit /b 1
)
