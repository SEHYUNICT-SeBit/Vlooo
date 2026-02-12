@echo off
REM Vlooo 백엔드 모니터 - EXE 빌드 배치 파일
chcp 65001 >nul

echo.
echo ========================================
echo   🎬 Vlooo Monitor GUI - EXE 빌드
echo ========================================
echo.

REM Python 확인
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python이 설치되어 있지 않습니다.
    pause
    exit /b 1
)

REM 1. 패키지 설치
echo [1/3] 📦 필요한 패키지 설치 중...
pip install -q -r requirements.txt

if errorlevel 1 (
    echo ❌ 패키지 설치 실패
    pause
    exit /b 1
)

REM 2. EXE 빌드
echo [2/3] 🔨 EXE 파일 생성 중...
pyinstaller --onefile --windowed --name vlooo-monitor monitor.py

if errorlevel 1 (
    echo ❌ EXE 파일 생성 실패
    pause
    exit /b 1
)

REM 3. 확인 및 복사
echo [3/3] ✅ 최종화 중...

if exist "dist\vlooo-monitor.exe" (
    echo.
    echo ========================================
    echo   ✅ EXE 파일 생성 완료!!!
    echo ========================================
    echo.
    echo 📍 위치: dist\vlooo-monitor.exe
    
    REM 현재 폴더에 복사
    copy "dist\vlooo-monitor.exe" "vlooo-monitor.exe" /Y >nul
    echo ✅ 현재 폴더에 복사 완료
    
    echo.
    echo ========================================
    echo   💡 사용법
    echo ========================================
    echo 1. vlooo-monitor.exe 더블클릭으로 실행
    echo 2. 또는 명령어로 실행:
    echo    .\vlooo-monitor.exe
    echo ========================================
    echo.
    
    REM 정리
    echo 🧹 임시 파일 정리 중...
    rmdir /S /Q build >nul 2>&1
    del vlooo-monitor.spec >nul 2>&1
    echo ✅ 정리 완료
    echo.
    
    pause
) else (
    echo ❌ EXE 파일 생성 실패
    echo.
    echo 다음을 확인하세요:
    echo  - Python이 설치되어 있는가
    echo  - PyInstaller가 설치되었는가
    echo  - monitor.py 파일이 존재하는가
    echo.
    pause
    exit /b 1
)
