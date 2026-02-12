# 🧪 로컬 환경 검증 및 배포 가이드

> **목표**: 로컬 환경 완전 검증 → 프로덕션 설정 기준화  
> **현재 상태**: 2026-02-12 코드 품질 ✅ 완료

---

## 📋 Phase 1: 로컬 환경 준비 (5분)

### Step 1-1: 터미널 3개 준비
```powershell
# 터미널 1 - Ollama 확인
ollama list

# 터미널 2 - FastAPI 시작
cd c:\vibe\Vlooo\backend
python main.py

# 터미널 3 - Next.js 시작 (새 터미널)
cd c:\vibe\Vlooo
npm run dev
```

### Step 1-2: 포트 확인
```powershell
# 실행 중인 포트 확인
netstat -ano | findstr ":3000|:8001|:11434"

# 예상 결과:
# TCP  0.0.0.0:3000   LISTENING  [PID]      ← Next.js
# TCP  0.0.0.0:8001   LISTENING  [PID]      ← FastAPI
# TCP  0.0.0.0:11434  LISTENING  [PID]      ← Ollama
```

✅ **모두 LISTENING 상태여야 함**

---

## 📺 Phase 2: 브라우저 테스트 (10분)

### Step 2-1: 홈페이지 접속
```
브라우저: http://localhost:3000
```

**✅ 확인 사항:**
- [ ] 홈 페이지 로드됨
- [ ] 햄버거 메뉴 클릭 가능
- [ ] "새 동영상 만들기" 버튼 보임
- [ ] 네비게이션 아이콘 렌더링 정상

### Step 2-2: 대시보드 페이지 접속
```
http://localhost:3000/dashboard
```

**✅ 확인 사항:**
- [ ] 대시보드 로드됨
- [ ] 통계 섹션 표시
- [ ] 사이드바 메뉴 정상

### Step 2-3: 로그인 테스트
```
- "로그인" 버튼 클릭
- 모달 팝업 확인
- 데모 계정 사용: demo@vlooo.ai / demo1234
```

**✅ 확인 사항:**
- [ ] 로그인 모달 열림
- [ ] 로그인 성공/실패 처리 정상

---

## 🎬 Phase 3: 변환 프로세스 테스트 (15분)

### Step 3-1: PPT 업로드
```
1. 홈페이지 (http://localhost:3000)
2. "새 동영상 만들기" 클릭
3. PPT 파일 선택 (또는 드래그)
```

**✅ 확인 사항:**
- [ ] FileUploadModal 열림
- [ ] PPT 파일 선택 가능
- [ ] 업로드 시작

### Step 3-2: 변환 진행 모니터링
```
ConversionProgressModal 에서:
- 슬라이드 파싱 진행도
- 스크립트 생성 (Ollama)
- TTS 음성 합성 (Google)
- FFmpeg 렌더링
```

**✅ 확인 사항:**
- [ ] 모든 단계 진행도 표시됨
- [ ] 에러 없이 완료됨
- [ ] 최종 MP4 파일 생성됨

### Step 3-3: 결과 확인
```
변환 완료 후:
- ResultsDisplay 페이지 표시
- MP4 비디오 플레이어 렌더링
- 다운로드 링크 작동
```

**✅ 확인 사항:**
- [ ] 비디오 재생 가능
- [ ] 슬라이드 + 음성 동기화 정상
- [ ] 파일 다운로드 성공

---

## 🔍 Phase 4: 브라우저 개발자 도구 검증 (5분)

### DevTools Console 확인
```powershell
# 브라우저에서 F12 → Console 탭
```

**✅ 확인 사항:**
- [ ] 빨간색 에러 없음
- [ ] 황색 경고 최소화
- [ ] API 호출 200/201 응답

### Network 탭 확인
```
주요 요청:
- GET /api/parse-ppt → 200
- POST /api/generate-script → 200
- POST /api/synthesize-tts → 200
- POST /api/render-video → 200
```

**✅ 확인 사항:**
- [ ] 모든 API 호출 성공 (2xx 응답)
- [ ] 404/500 에러 없음
- [ ] CORS 에러 없음

---

## ✅ 로컬 검증 체크리스트

### 완료된 검증
- [ ] 포트 확인 (3000, 8001, 11434 모두 LISTENING)
- [ ] 홈/대시보드 페이지 로드
- [ ] 네비게이션 정상 작동
- [ ] 로그인 프로세스
- [ ] PPT 업로드 및 변환
- [ ] MP4 재생 및 다운로드
- [ ] 브라우저 Console 에러 0개

### 검증 날짜 & 시간
```
검증 완료 날짜: _______________
검증 담당자: _______________
최종 상태: ✅ 정상 / ❌ 문제 있음
```

---

## 🚀 로컬 검증 완료 후: 프로덕션 설정 기준화

### 로컬 환경 변수 (현재 기준)
```bash
# .env.local (사실상의 ' 표준' - 로컬용)
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8001
NEXTAUTH_URL=http://localhost:3000
OLLAMA_URL=http://localhost:11434
FFMPEG_PATH=C:\vibe\Vlooo\ffmeg\bin\ffmpeg.exe
AUTH_DEMO_EMAIL=demo@vlooo.ai
AUTH_DEMO_PASSWORD=demo1234
```

### 프로덕션 환경 변수 (로컬 기준으로 작성)
```bash
# .env.production (프로덕션용 - 로컬 기반)
NEXT_PUBLIC_FASTAPI_URL=https://api.yourdomain.com ← localhost:8001 대체
NEXTAUTH_URL=https://yourdomain.com ← localhost:3000 대체
OLLAMA_URL=https://ollama-server-internal:11434 ← localhost:11434 대체
FFMPEG_PATH=/usr/bin/ffmpeg ← Windows 경로 → Linux 경로
AUTH_DEMO_EMAIL= ← 프로덕션에서 비활성화
AUTH_DEMO_PASSWORD= ← 프로덕션에서 비활성화
```

---

## 📝 로컬 검증 완료 후 진행 사항

### 1단계: 로컬 완전 검증 ✅ 필수
- 모든 기능 테스트 완료
- 에러 0개
- MP4 품질 확인

### 2단계: 로컬 환경 파일 확정 ✅ 필수
- `.env.local` 최종 정리
- Git에 커밋하지 않음 (.gitignore에 이미 포함)

### 3단계: 프로덕션 환경 파일 작성 (다음 단계)
- `.env.production` 로컬 기반으로 작성
- Cloudflare Pages 대시보드에서 환경 변수 설정

### 4단계: Cloudflare 배포 (최종 단계)
- 빌드 및 배포
- 프로덕션 URL 테스트

---

## 🔗 관련 파일

- **로컬 설정**: [.env.local](.env.local)
- **프로덕션 설정**: [.env.production](.env.production)
- **공통 설정**: [.env](.env)
- **예제 (로컬)**: [.env.local.example](.env.local.example)
- **예제 (프로덕션)**: [.env.production.example](.env.production.example)

---

**작성일**: 2026-02-12  
**현재 상태**: 🔄 로컬 검증 준비 중
