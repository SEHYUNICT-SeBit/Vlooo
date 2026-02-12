# 🚀 프로덕션 배포 준비 가이드

> **목표**: 로컬 검증 완료 → Cloudflare Pages 배포 완료  
> **상태**: 🔄 프로덕션 환경 설정 및 배포 단계  
> **시작일**: 2026-02-12

---

## 📋 사전 요구사항

### 1. Cloudflare 계정
- [ ] Cloudflare 계정 생성
- [ ] Cloudflare Pages 접근 가능 확인
- [ ] 도메인 준비 또는 `[projectname].pages.dev` 사용

### 2. GitHub 저장소
- [x] GitHub 저장소에 모든 코드 푸시
- [x] `.gitignore`에서 `.env*` 패일 제외 확인

### 3. 필수 정보
- [ ] NEXTAUTH_SECRET 생성 (32자 이상 난수)
- [ ] FastAPI 백엔드 배포 URL 결정
- [ ] Cloudflare R2 버킷 정보 (선택사항)

---

## 🔑 Step 1: NEXTAUTH_SECRET 생성

프로덕션용 강력한 난수 생성:

```powershell
# Windows PowerShell
$random = [Convert]::ToBase64String((1..32 | % { Get-Random -Max 256 }) -as [byte[]])
Write-Host "NEXTAUTH_SECRET=$random"

# 또는 온라인 도구 사용
# https://www.random.org/strings/
```

**📌 복사할 NEXTAUTH_SECRET:**
```
(이 값을 생성해서 기록해둘 것)
```

---

## 📝 Step 2: .env.production 최종 작성

현재 로컬 설정을 기반으로 프로덕션 환경 변수를 확정합니다.

### 로컬 → 프로덕션 매핑

| 항목 | 로컬 | 프로덕션 |
|------|------|---------|
| **Frontend API** | `http://localhost:8001` | `https://api.yourdomain.com` |
| **NextAuth URL** | `http://localhost:3000` | `https://yourdomain.com` |
| **Ollama Server** | `http://localhost:11434` | `http://[internal-server]:11434` |
| **FFmpeg Path** | `C:\vibe\Vlooo\ffmeg\bin\ffmpeg.exe` | `/usr/bin/ffmpeg` |
| **Demo Accounts** | 활성화 | 비활성화 권장 |
| **NextAuth Secret** | `local-dev-secret-123...` | `[생성한 난수]` |

### 프로덕션 .env.production 템플릿

```bash
# ============================================
# 프로덕션 환경 변수 (.env.production)
# ============================================

# 프론트엔드 설정
NEXT_PUBLIC_APP_ENV=production

# API 설정
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_FASTAPI_URL=https://api.yourdomain.com

# 백엔드 설정
FASTAPI_URL=https://api.yourdomain.com
FASTAPI_PORT=443
FASTAPI_PUBLIC_URL=https://api.yourdomain.com

# AI/LLM 설정
LOCAL_LLM_PROVIDER=ollama
OLLAMA_URL=http://[internal-ollama-server]:11434
OLLAMA_MODEL=llama3.1:8b

# 인증 설정
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=[생성한 난수 32자 이상]

# 시스템 설정
FFMPEG_PATH=/usr/bin/ffmpeg

# 로깅
LOG_LEVEL=WARN

# ============================================
# 데모 계정 (프로덕션에서 비활성화 권장)
# ============================================
# AUTH_DEMO_EMAIL=
# AUTH_DEMO_PASSWORD=

# ============================================
# 선택사항: Cloudflare R2 (생성 후 설정)
# ============================================
# CLOUDFLARE_R2_BUCKET=vlooo-media
# CLOUDFLARE_R2_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
# CLOUDFLARE_R2_ACCESS_KEY=
# CLOUDFLARE_R2_SECRET_KEY=
```

---

## 🌐 Step 3: Cloudflare Pages 프로젝트 생성

### 3-1: Cloudflare Dashboard 접속
1. https://dash.cloudflare.com 로그인
2. **Pages** 섹션 클릭

### 3-2: 프로젝트 생성
1. **"Create a project"** 클릭
2. **"Connect to Git"** 선택
3. GitHub 리포지토리 선택 (`Vlooo`)

### 3-3: 빌드 설정
```
Framework preset: Next.js
Build command: npm run pages:build
Build output directory: .vercel/output/static
Root directory: (빈 상태 유지)
```

### 3-4: 환경 변수 설정
1. **Settings** → **Environment variables**
2. 다음 변수들 추가 (Product 환경):
   ```
   NEXT_PUBLIC_API_URL = https://api.yourdomain.com
   NEXT_PUBLIC_FASTAPI_URL = https://api.yourdomain.com
   NEXTAUTH_URL = https://yourdomain.com
   NEXTAUTH_SECRET = [생성한 난수]
   ```

---

## ⚙️ Step 4: GitHub Actions 체계 (선택사항)

`.github/workflows/deploy.yml` 를 생성해서 자동 배포:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_FASTAPI_URL: ${{ secrets.NEXT_PUBLIC_FASTAPI_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
        run: npm run pages:build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: vlooo
          directory: .vercel/output/static
```

---

## 🚀 Step 5: 배포 실행

### Option A: Cloudflare Dashboard에서 자동 배포
1. GitHub 푸시하면 자동 배포
2. Deployments 탭에서 진행 상황 모니터링

### Option B: Wrangler CLI로 수동 배포
```bash
npm run build
npm run pages:deploy
```

---

## ✅ Step 6: 배포 후 검증

### 배포 완료 확인
```
Cloudflare Dashboard → Pages → Deployments → 최신 배포 클릭
```

**확인 사항:**
- [ ] Build successful (초록색 ✓)
- [ ] Status: Active (배포 완료)
- [ ] Preview URL 생성됨

### URL 테스트
```
Production URL: https://vlooo.pages.dev
또는 커스텀 도메인
```

**테스트 항목:**
- [ ] 홈페이지 로드 (`/`)
- [ ] 대시보드 접속 (`/dashboard`)
- [ ] 로그인 기능
- [ ] API 연동 (FastAPI 연결 확인)
- [ ] 반응형 디자인 (모바일/태블릿)

### 브라우저 DevTools 검증
```
F12 → Console → 에러 확인
F12 → Network → API 호출 상태 확인
```

---

## 🔧 백엔드 배포 (FastAPI)

⚠️ **Cloudflare Pages는 정적 프론트엔드만 호스팅합니다.**  
FastAPI 백엔드는 별도 서버에 배포 필요합니다.

### 추천 배포 옵션

| 서비스 | 장점 | 비용 |
|--------|------|------|
| **Railway** | 간단, Procfile 지원 | ~$7/month |
| **Render** | 무료 tier 지원 | Free~$7/month |
| **Google Cloud Run** | 서버리스, 확장성 | 사용량 기반 |
| **AWS Lambda** | 엔터프라이즈급 | 사용량 기반 |

### Railway 배포 예시
```bash
# Procfile 생성
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Railway와 연동 후 push
git push railway main
```

배포 후 FastAPI URL을 프로덕션 `.env.production`의 `FASTAPI_URL`로 설정합니다.

---

## 📊 배포 체크리스트

### 배포 전
- [ ] `.env.production` 작성 완료
- [ ] NEXTAUTH_SECRET 생성 및 기록
- [ ] 모든 API 도메인 확정
- [ ] GitHub 모든 변경사항 푸시
- [ ] `npm run build` 로컬에서 성공 확인

### Cloudflare 설정
- [ ] Cloudflare Pages 프로젝트 생성
- [ ] GitHub 연동 설정
- [ ] 빌드 설정 완료 (npm run pages:build)
- [ ] 환경 변수 모두 설정
- [ ] 배포 트리거

### 배포 후
- [ ] Cloudflare Deployments에서 "Active" 상태 확인
- [ ] 배포 URL 접속 가능
- [ ] 모든 페이지 렌더링
- [ ] 로그인 기능 작동
- [ ] API 연동 확인

### 문제 해결
- [ ] Cloudflare Deployments 로그 확인
- [ ] 브라우저 Console 에러 확인
- [ ] Network 탭에서 API 요청 상태 확인

---

## 📞 문제 발생 시

### 빌드 실패
```bash
# 로컬에서 처음부터 빌드 시도
rm -rf .next .vercel node_modules
npm install
npm run pages:build
```

### API 연결 실패
```
확인 사항:
1. NEXT_PUBLIC_FASTAPI_URL이 실제 FastAPI 도메인인가?
2. FastAPI CORS 설정이 Cloudflare Pages URL을 허용하는가?
3. FastAPI가 실제로 배포되어 있는가?
```

### 환경 변수 미적용
```
환경 변수 설정 후 재배포 필요 (GitHub push 또는 Cloudflare 대시보드에서 재배포)
```

---

## 🎯 배포 후 최종 단계

1. **모든 기능 재검증**
   - PPT 업로드 → 변환 → 다운로드 전체 흐름 테스트

2. **성능 모니터링**
   - 로딩 시간 측정
   - API 응답 속도 확인

3. **보안 검증**
   - HTTPS 사용 확인
   - 인증 토큰 처리 확인

4. **다음 단계 계획**
   - 추가 기능 개발 (Phase 2)
   - 사용자 피드백 수집
   - 성능 최적화

---

**작성일**: 2026-02-12  
**상태**: 🔄 배포 준비 진행 중
