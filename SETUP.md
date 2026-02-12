# Vlooo 로컬 개발 환경 설정 가이드

> ⚠️ **Windows 개발자 필독:** [WINDOWS_ENCODING_RULES.md](WINDOWS_ENCODING_RULES.md)를 반드시 읽어주세요!  
> (이모지 사용 금지, CP949 인코딩 규칙)

## 📋 목차
1. [필수 요구사항](#필수-요구사항)
2. [환경 설정](#환경-설정)
3. [실행 순서](#실행-순서)
4. [변환 플로우](#변환-플로우)
5. [문제 해결](#문제-해결)

---

## 🔧 필수 요구사항

### 1. Ollama 설치 (AI 스크립트 생성용)
```powershell
# Windows
# https://ollama.ai/download 에서 다운로드

# 설치 확인
ollama --version

# Llama 3.1 모델 다운로드
ollama pull llama3.1

# Ollama 서버 실행
ollama serve
```

**확인**: 브라우저에서 http://localhost:11434 접속 → "Ollama is running" 메시지

### 2. FFmpeg 설치 (영상 렌더링용)
```powershell
# Windows - Gyan.dev에서 다운로드
# https://www.gyan.dev/ffmpeg/builds/
# ffmpeg-git-essentials.7z 또는 ffmpeg-git-full.7z 다운로드

# 설치 경로 예시
# C:\vibe\Vlooo\ffmeg\bin\ffmpeg.exe

# 확인
C:\vibe\Vlooo\ffmeg\bin\ffmpeg.exe -version
```

### 3. Node.js & Python
```powershell
# Node.js 18+ 확인
node --version

# Python 3.10+ 확인
python --version
```

---

## ⚙️ 환경 설정

### 1. 환경 변수 파일 생성
```powershell
# .env.local.example 파일을 복사
cp .env.local.example .env.local
```

### 2. `.env.local` 필수 설정 확인

```dotenv
# ✅ 백엔드 포트 (반드시 8001)
FASTAPI_PORT=8001
FASTAPI_URL=http://localhost:8001

# ✅ Ollama 설정 (로컬 LLM)
LOCAL_LLM_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1

# ✅ FFmpeg 경로 (실제 파일 존재 확인!)
FFMPEG_PATH=C:\vibe\Vlooo\ffmeg\bin\ffmpeg.exe

# ⚠️ OpenAI는 Ollama 사용 시 불필요
# OPENAI_API_KEY는 비워두거나 제거
```

### 3. 체크리스트
- [ ] Ollama가 실행 중 (포트 11434)
- [ ] FFmpeg 파일이 존재 (경로 확인)
- [ ] FASTAPI_PORT=8001로 설정
- [ ] LOCAL_LLM_PROVIDER=ollama로 설정

---

## 🚀 실행 순서

### 1. 백엔드 실행

**방법 A: 모니터 GUI (추천)**
```powershell
cd C:\vibe\Vlooo\backgui
python monitor.py
```
- "Local Backend" 선택
- "Start Backend" 클릭

**방법 B: 터미널 직접 실행**
```powershell
cd C:\vibe\Vlooo\backend
python main.py
```

**확인**: `Uvicorn running on http://0.0.0.0:8001` 메시지

### 2. 프론트엔드 실행
```powershell
cd C:\vibe\Vlooo
npm run dev
```

**확인**: `http://localhost:3000` 에 접속

---

## 🎬 변환 플로우

### 1. PPT 업로드
- 브라우저: http://localhost:3000/convert
- PPT 파일 선택 및 업로드

### 2. 진행 단계 (총 4단계)

#### Stage 1: 파싱 (Parsing)
```
[PPT] [START] → [PPT] [DONE] slides=8
```
- PPT 파일에서 슬라이드 추출
- 텍스트, 이미지, 노트 파싱

#### Stage 2: 스크립트 생성 (Scripting)
```
[SCRIPT] [START] → [SLIDE_1] 1/8 → ... → [SLIDE_8] 8/8 → [DONE]
```
- Ollama (Llama 3.1)로 AI 스크립트 생성
- 슬라이드별 30-60초 나레이션

#### Stage 3: 음성 합성 (TTS)
```
[TTS] [START] → [TTS] [DONE] audio=8
```
- Google TTS로 음성 생성
- 총 음성 길이 계산

#### Stage 4: 영상 렌더링 (Rendering)
```
[RENDER] [START] → [RENDER] [DONE]
```
- FFmpeg로 슬라이드 + 오디오 결합
- 최종 MP4 영상 생성

### 3. 다운로드
- 렌더링 완료 후 다운로드 버튼 클릭

---

## 🐛 문제 해결

### ⚠️ Windows 인코딩 오류 (UnicodeEncodeError)
**증상**: `UnicodeEncodeError: 'cp949' codec can't encode character`
**원인**: 백엔드 Python 코드에 이모지 사용
**해결**: 
1. **절대 금지**: 모든 `print()` 문에서 이모지 제거
2. **필독**: [WINDOWS_ENCODING_RULES.md](WINDOWS_ENCODING_RULES.md) 확인
3. ASCII 문자만 사용: `OK -`, `ERROR -`, `WARN -`

### Ollama 404 오류 (Model not found)
**증상**: `404 Client Error: Not Found for url: http://localhost:11434/api/generate`
**원인**: 잘못된 모델명 또는 API 엔드포인트
**해결**:
1. **모델명 확인**:
   ```powershell
   ollama list
   # 출력: llama3.1:8b (콜론 뒤에 버전 포함 확인!)
   ```
2. `.env.local`에서 **정확한 모델명** 사용:
   ```
   OLLAMA_MODEL=llama3.1:8b  # ⭕ 올바름
   OLLAMA_MODEL=llama3.1     # ❌ 틀림 - 404 발생
   ```
3. **API 엔드포인트 확인**: 
   - ⭕ `/api/generate` (Ollama 공식)
   - ❌ `/api/chat` (다른 LLM API)
4. 백엔드 재시작

### .env.local 로딩 안됨
**증상**: 환경 변수가 적용되지 않음 (포트 8000, OpenAI 사용 등)
**해결**:
1. `.env.local` 파일 위치 확인: 프로젝트 루트 (C:\vibe\Vlooo\.env.local)
2. `backend/main.py` 확인:
   ```python
   PROJECT_ROOT = Path(__file__).resolve().parent.parent
   ENV_FILE = PROJECT_ROOT / ".env.local"
   load_dotenv(dotenv_path=str(ENV_FILE))
   ```
3. 백엔드 재시작

### 백엔드가 8000 포트로 실행됨
**증상**: `Uvicorn running on http://0.0.0.0:8000`
**해결**: `.env.local`에 `FASTAPI_PORT=8001` 추가 → 백엔드 재시작

### OpenAI API 에러 (401, 429)
**증상**: `OpenAI API 오류: Incorrect API key` 또는 `insufficient_quota`
**해결**: `.env.local`에서 `LOCAL_LLM_PROVIDER=ollama` 설정 확인 → 백엔드 재시작

### FFmpeg 파일 없음 (WinError 2)
**증상**: `[RENDER] [ERROR] [WinError 2] 지정된 파일을 찾을 수 없습니다`
**해결**:
1. FFmpeg 설치 확인: `C:\vibe\Vlooo\ffmeg\bin\ffmpeg.exe` 파일 존재 여부
2. `.env.local`의 `FFMPEG_PATH` 경로 확인
3. 백엔드 재시작

### Ollama 연결 안됨
**증상**: `Connection refused to localhost:11434`
**해결**:
1. Ollama 실행 확인: `ollama serve`
2. 브라우저에서 http://localhost:11434 접속 확인
3. 백엔드 재시작

### 포트 충돌
**증상**: `Address already in use`
**해결**:
```powershell
# 포트 사용 프로세스 확인
netstat -ano | findstr :8001
netstat -ano | findstr :3000
netstat -ano | findstr :11434

# 프로세스 종료 (PID는 netstat 결과에서 확인)
taskkill /PID [PID번호] /F
```

### 브라우저 콘솔 에러: net::ERR_CONNECTION_REFUSED
**증상**: 프론트엔드가 백엔드에 연결 못함
**해결**:
1. 백엔드가 실행 중인지 확인 (포트 8001)
2. `.env.local`의 `NEXT_PUBLIC_API_URL` 확인
3. 프론트엔드 재시작 (`npm run dev`)

---

## 📊 로그 확인

### 백엔드 로그 (모니터 GUI)
- 로그 수준별 색상 구분
- 타임스탬프 + 단계 정보

### 브라우저 콘솔 (DevTools)
- F12 → Console 탭
- Network 탭에서 API 요청 상태 확인

### 체크포인트 파일
```powershell
# 변환 진행 상태 저장 위치
ls C:\vibe\Vlooo\backend\media\checkpoints\
```

---

## ✅ 정상 작동 확인

모든 것이 정상이면:
1. ✅ 백엔드: `http://0.0.0.0:8001` 실행 중
2. ✅ 프론트엔드: `http://localhost:3000` 접속 가능
3. ✅ Ollama: `http://localhost:11434` 응답
4. ✅ PPT → 영상 변환 완료

---

**다음 단계**: [DEPLOYMENT.md](./DEPLOYMENT.md) - 프로덕션 배포 가이드
