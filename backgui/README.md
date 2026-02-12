# 🎬 Vlooo 백엔드 모니터

Vlooo 백엔드를 쉽게 제어하고 모니터링할 수 있는 GUI 도구입니다.

## 🚀 빠른 시작

### 방법 1: Python 직접 실행 (추천)
```bash
# 더블클릭으로 실행
run.bat
```

또는

```bash
# 명령어로 실행
python monitor.py
```

### 방법 2: EXE 파일 생성 후 실행

1. **EXE 빌드**:
```bash
build.bat
```

2. **실행**:
```bash
vlooo-monitor.exe
```

또는 더블클릭으로 `vlooo-monitor.exe` 실행

## 💾 설치 요구사항

- Python 3.8+
- requests 라이브러리
- (EXE 빌드 시) PyInstaller

필요한 패키지는 자동으로 설치됩니다.

## 🎨 GUI 기능

### 상단 - 제어 버튼
- **▶ 백엔드 시작**: Vlooo 백엔드 프로세스 시작
- **⏹ 백엔드 종료**: Graceful 종료 (또는 5초 후 강제 종료)
- **🔄 재시작**: 백엔드 재시작

### 중간 - 실시간 로그 창
구조화된 로그 출력 (색상 구분):
```
[HH:MM:SS] [MAJOR] [BACKEND] ✅ 백엔드 시작됨
[HH:MM:SS] [MINOR] [LOG] 로그 메시지
[HH:MM:SS] [CRITICAL] [ERROR] 에러 메시지
```

### 하단 - 프로젝트 정보
모니터링 중인 프로젝트 ID 표시

## 📊 로그 색상

| 레벨 | 색상 | 용도 |
|------|------|------|
| **MAJOR** | 🟢 청록색 | 중요한 이벤트 (시작/완료/성공) |
| **MINOR** | 🔵 파란색 | 일반 로그 |
| **CRITICAL** | 🔴 빨간색 | 에러 메시지 (굵은 글씨) |
| **WARNING** | 🟡 노란색 | 경고 메시지 |

## 🛠️ 구조

```
backgui/
├── monitor.py           # GUI 애플리케이션 (메인)
├── requirements.txt     # Python 의존성
├── run.bat             # Python 직접 실행 배치
├── build.bat           # EXE 빌드 배치
├── vlooo-monitor.exe   # 빌드된 EXE 파일 (build.bat 실행 후 생성)
└── README.md           # 이 파일
```

## 🔍 작동 원리

1. **백엔드 프로세스 관리**:
   - `c:\vibe\Vlooo\backend\main.py` 자동 실행
   - stdout/stderr 실시간 캡처 및 파싱

2. **로그 분석**:
   - 백엔드 로그를 `[timestamp] [LEVEL] [STEP] message` 형식으로 파싱
   - 로그 레벨별로 색상 구분

3. **상태 모니터링**:
   - 5초마다 `/api/health` 엔드포인트 확인
   - 백엔드 응답 상태 표시

## 🌙 다크모드 색상 팔레트

- **배경**: `#1e1e1e` (진검은)
- **텍스트**: `#e0e0e0` (밝은 회색)
- **강조**: `#4ec9b0` (청록색)
- **경고**: `#dcdcaa` (노란색)
- **에러**: `#f48771` (빨간색)

VS Code 다크모드 스타일과 동일합니다.

## 🆘 문제해결

### Q: "Python이 설치되어 있지 않습니다" 오류
**A**: https://www.python.org/downloads/ 에서 Python 설치

### Q: "모니터 실행 중 오류가 발생했습니다" 오류
**A**: 
1. Python 경로 확인
2. `pip install requests` 실행
3. `python monitor.py` 직접 실행하여 에러 메시지 확인

### Q: GUI가 나타나지 않음
**A**:
1. 명령 프롬프트 창 확인 (백그라운드에 있을 수 있음)
2. 작업 관리자에서 Python 프로세스 확인
3. 방화벽 설정 확인

### Q: "백엔드가 연결되지 않음" 상태
**A**:
1. 백엔드가 실제로 실행 중인지 확인
2. 포트 8001이 사용 가능한지 확인: `netstat -ano | findstr :8001`

## 📝 로그 예시

```
[09:15:23] [MAJOR] [BACKEND] ✅ 백엔드 시작됨 (PID: 12345)
[09:15:24] [MINOR] [LOG] ✅ Ollama is already running
[09:15:25] [INFO] [LOG] INFO:     Uvicorn running on http://0.0.0.0:8001
[09:15:30] [MAJOR] [PARSING] PPT 파일 분석 중...
[09:15:31] [MINOR] [PARSING] [1/11] 슬라이드 처리 중...
[09:15:32] [MINOR] [PARSING] [2/11] 슬라이드 처리 중...
...
[09:16:00] [MAJOR] [PARSING_DONE] PPT 분석 완료 (11개 슬라이드)
[09:16:01] [MAJOR] [SCRIPTING] 스크립트 생성 시작...
```

## 🔧 환경 변수 (선택사항)

```bash
# 백엔드 API URL 변경 (기본값: http://localhost:8001)
set FASTAPI_URL=http://your-server:8001
```

## 📄 라이선스

Vlooo 프로젝트로부터 상속

---

**개발자**: Vlooo Team  
**마지막 업데이트**: 2026-02-11
