# Vlooo - AI 기반 PPT to Video 변환 서비스

> "내 PPT가 전문가의 영상으로 흐르다"

[![Status](https://img.shields.io/badge/status-MVP%20Development-yellow)]()
[![Platform](https://img.shields.io/badge/platform-Web%20%2B%20Cloud-blue)]()

## ⚠️ Windows 개발자 필독

**반드시 읽어주세요:** [WINDOWS_ENCODING_RULES.md](WINDOWS_ENCODING_RULES.md)

- Windows CP949 인코딩 환경에서는 **이모지 사용 금지**
- 모든 `print()` 문은 **ASCII 문자만 사용**
- 이 규칙을 어기면 `UnicodeEncodeError` 발생

---

## 📖 프로젝트 개요

Vlooo는 PowerPoint 프레젠테이션을 AI가 생성한 전문가 음성 나레이션과 함께 고품질 비디오로 자동 변환하는 B2C 웹 플랫폼입니다.

### 핵심 가치

- **Professionalism (전문성)**: IT 전문가 페르소나 기반 AI 스크립트
- **Ease (편의성)**: 3단계 업로드 → 스크립트 확인 → 다운로드
- **Speed (속도)**: 평균 5-10분 내 변환 완료

## 🏗️ 기술 스택

### Frontend
- **Framework**: Next.js 14+ (App Router), React 18+, TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Deployment**: Cloudflare Pages

### Backend
- **Framework**: FastAPI (Python 3.13)
- **AI**: Ollama (Llama 3.1:8b) - 로컬 LLM
- **TTS**: Google Cloud Text-to-Speech
- **Video**: FFmpeg
- **Storage**: Cloudflare R2
- **Deployment**: Cloudflare Workers (serverless)

## 📁 프로젝트 구조

```
Vlooo/
├── README.md                         # 이 파일
├── WINDOWS_ENCODING_RULES.md         # ⚠️ Windows 필독 문서
├── SETUP.md                          # 로컬 개발 환경 설정 가이드
├── DEPLOYMENT.md                     # 프로덕션 배포 가이드
├── STATUS.md                         # 프로젝트 현황
├── .env.local                        # 로컬 환경 변수 (Git 제외)
├── .env.local.example                # 환경 변수 템플릿
├── .env.production.example           # 프로덕션 환경 변수 템플릿
│
├── src/                              # Next.js 프론트엔드
│   ├── app/                          # App Router 페이지
│   ├── components/                   # React 컴포넌트
│   ├── data/                         # 메뉴 및 정적 데이터
│   ├── hooks/                        # 커스텀 훅
│   ├── services/                     # API 통신
│   └── types/                        # TypeScript 타입
│
└── backend/                          # FastAPI 백엔드
    ├── main.py                       # 엔트리 포인트
    ├── monitor.py                    # GUI 모니터링 도구
    ├── app/
    │   ├── routes/                   # API 라우터
    │   │   ├── ppt.py               # PPT 파싱
    │   │   ├── script.py            # AI 스크립트 생성
    │   │   ├── tts.py               # 음성 합성
    │   │   └── render.py            # 비디오 렌더링
    │   └── services/                 # 비즈니스 로직
    │       ├── ppt_parser.py
    │       ├── script_generator.py
    │       ├── tts_service.py
    │       └── video_renderer.py
    └── media/                        # 임시 파일 저장
        └── checkpoints/              # 프로젝트 체크포인트
```

## 🚀 빠른 시작

### 1. 필수 사전 설치

- **Ollama**: [https://ollama.ai/download](https://ollama.ai/download)
- **FFmpeg**: [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
- **Node.js 18+**: [https://nodejs.org](https://nodejs.org)
- **Python 3.13+**: [https://www.python.org](https://www.python.org)

### 2. 환경 설정

```bash
# 프로젝트 클론
git clone [repository-url]
cd Vlooo

# 환경 변수 설정
copy .env.local.example .env.local
# .env.local 파일을 편집하여 설정값 입력

# Ollama 모델 다운로드
ollama pull llama3.1:8b
```

### 3. 백엔드 실행

```powershell
# 방법 1: GUI 모니터 사용 (권장)
cd backend
python monitor.py
# GUI에서 "Start Backend" 클릭

# 방법 2: 직접 실행
cd backend
python main.py
```

### 4. 프론트엔드 실행

```bash
npm install
npm run dev
```

### 5. 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8001
- **API 문서**: http://localhost:8001/docs

## 📚 문서

| 문서 | 설명 |
|------|------|
| [WINDOWS_ENCODING_RULES.md](WINDOWS_ENCODING_RULES.md) | **⚠️ 필독** - Windows 인코딩 규칙 |
| [SETUP.md](SETUP.md) | 로컬 개발 환경 상세 설정 가이드 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 프로덕션 배포 가이드 |
| [STATUS.md](STATUS.md) | 프로젝트 현황 및 완료 항목 |
| [README_MENU.md](README_MENU.md) | 메뉴 시스템 문서 |
| [backend/README.md](backend/README.md) | 백엔드 API 문서 |

## 🔧 주요 기능

### 1. PPT 파싱
- python-pptx 기반 슬라이드 추출
- 텍스트, 이미지, 레이아웃 분석

### 2. AI 스크립트 생성
- Ollama (Llama 3.1:8b) 로컬 LLM 사용
- IT 전문가 페르소나 기반 나레이션
- 슬라이드별 자연스러운 연결

### 3. 음성 합성 (TTS)
- Google Cloud Text-to-Speech
- 다양한 음성 옵션 (전문가/친근한 톤)
- 속도 조절 가능

### 4. 비디오 렌더링
- FFmpeg 기반 비디오 생성
- 720p/1080p/4K 지원
- 슬라이드 + 음성 동기화

### 5. 체크포인트 시스템
- 단계별 진행 상태 저장
- 서버 재시작 후에도 재개 가능

## 🔍 문제 해결

### Windows 인코딩 오류

```
UnicodeEncodeError: 'cp949' codec can't encode character...
```

**해결:** [WINDOWS_ENCODING_RULES.md](WINDOWS_ENCODING_RULES.md) 참조

### Ollama 404 오류

```powershell
# 모델 확인
ollama list

# .env.local에서 정확한 모델명 사용
OLLAMA_MODEL=llama3.1:8b  # ⭕ 올바름
OLLAMA_MODEL=llama3.1     # ❌ 틀림
```

### FFmpeg 오류

```powershell
# FFmpeg 설치 확인
ffmpeg -version

# .env.local에 경로 설정
FFMPEG_PATH=C:\vibe\Vlooo\ffmeg\bin\ffmpeg.exe
```

더 많은 문제 해결: [SETUP.md - 문제 해결](SETUP.md#문제-해결)

## 📊 프로젝트 현황

- ✅ 프론트엔드: 메뉴 시스템, 페이지 구조 완료
- ✅ 백엔드: API 구조, 체크포인트 시스템 완료
- ✅ Ollama 통합: 로컬 LLM 스크립트 생성
- ✅ FFmpeg 통합: 비디오 렌더링
- 🟡 E2E 테스트: 전체 플로우 테스트 진행 중

자세한 현황: [STATUS.md](STATUS.md)

## 🤝 기여

이 프로젝트는 현재 비공개 개발 중입니다.

## 📝 라이선스

비공개 프로젝트 (라이선스 미정)

---

**마지막 업데이트**: 2026-02-11  
**버전**: MVP v1.0  
**상태**: 🟡 개발 진행 중
