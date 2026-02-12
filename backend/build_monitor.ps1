# EXE 빌드 스크립트 (다크모드 GUI 버전)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  🎬 Vlooo Monitor GUI - EXE 빌드" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. 필요한 패키지 설치
Write-Host "[1/3] 📦 필요한 패키지 설치 중..." -ForegroundColor Yellow
pip install -r monitor_requirements.txt -q

# 2. PyInstaller로 EXE 빌드
Write-Host "[2/3] 🔨 EXE 파일 생성 중..." -ForegroundColor Yellow
pyinstaller `
    --onefile `
    --windowed `
    --name "vlooo-monitor" `
    --add-data ".:." `
    --console `
    monitor.py

# 3. 빌드 결과 확인
Write-Host "[3/3] ✅ 최종화 중..." -ForegroundColor Yellow

if (Test-Path "dist\vlooo-monitor.exe") {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  ✅ EXE 파일 생성 완료!!!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "📍 위치: $(Get-Item 'dist\vlooo-monitor.exe' | % FullName)" -ForegroundColor Cyan
    Get-Item "dist\vlooo-monitor.exe" | ForEach-Object { Write-Host "   크기: $([math]::Round($_.Length / 1MB, 2)) MB" -ForegroundColor Cyan }
    
    # 파일 복사 (현재 폴더에)
    Copy-Item "dist\vlooo-monitor.exe" "vlooo-monitor.exe" -Force
    Write-Host "`n✅ 현재 폴더에 복사 완료" -ForegroundColor Green
    
    # 사용법 안내
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  💡 사용법" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "1. 더블클릭으로 실행:" -ForegroundColor White
    Write-Host "   .\vlooo-monitor.exe" -ForegroundColor Green
    Write-Host "`n2. 또는 다음 명령어로 실행:" -ForegroundColor White
    Write-Host "   .\vlooo-monitor.exe" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    # 정리
    Write-Host "🧹 임시 파일 정리 중..." -ForegroundColor Gray
    Remove-Item -Path "build" -Recurse -Force 2>$null
    Remove-Item -Path "vlooo-monitor.spec" -Force 2>$null
    Write-Host "✅ 정리 완료`n" -ForegroundColor Green
    
} else {
    Write-Host "`n❌ EXE 파일 생성 실패`n" -ForegroundColor Red
    Write-Host "다음을 확인하세요:" -ForegroundColor Yellow
    Write-Host "  1. Python이 설치되어 있는가" -ForegroundColor Gray
    Write-Host "  2. PyInstaller가 설치된 후인가" -ForegroundColor Gray
    Write-Host "  3. monitor.py 파일이 존재하는가" -ForegroundColor Gray
}

