# Cloudflare Pages 배포 가이드 (Next.js + Cloudflare Adapter)

## 📋 사전 요구사항

### 1) 필수 패키지 설치 확인
```bash
npm install --save-dev @cloudflare/next-on-pages wrangler
```

### 2) 환경 변수 보안
- `.env` 또는 `.env.local` 파일에 실제 키를 저장하고 **절대 커밋하지 마세요**
- `.gitignore`에 `.env*` 패턴이 포함되어 있는지 확인
- 이미 커밋된 경우: `git rm --cached .env && git commit -m "Remove env file"`

---

## 🔧 로컬 빌드 및 테스트

### 1) Cloudflare Pages 빌드
```bash
# 일반 Next.js 빌드
npm run build

# Cloudflare Pages 전용 빌드
npm run pages:build
```

### 2) 로컬 Cloudflare Pages 프리뷰
```bash
# Wrangler로 로컬에서 Cloudflare Workers 환경 시뮬레이션
npm run cf:preview
```

**접속**: http://localhost:8788

---

## 🚀 Cloudflare Pages 배포

### 방법 1: GitHub 연동 자동 배포 (권장)

#### Step 1: GitHub 리포지토리 준비
```bash
git remote add origin https://github.com/SEHYUNICT-SeBit/Vlooo.git
git branch -M main
git push -u origin main
```

#### Step 2: Cloudflare Pages 프로젝트 생성
1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages** → **Create a project**
2. **Connect to Git** → GitHub 리포지토리 선택
3. **Build settings** 설정:
   ```
   Framework preset: Next.js (Static HTML Export)
   Build command: npm run pages:build
   Build output directory: .vercel/output/static
   Root directory: (leave blank)
   ```

#### Step 3: 환경 변수 설정
Cloudflare Dashboard → Pages → Settings → Environment variables

**Production 환경 변수**:
```bash
NEXT_PUBLIC_API_URL=https://your-domain.pages.dev
NEXTAUTH_URL=https://your-domain.pages.dev
NEXTAUTH_SECRET=<강력한-랜덤-문자열-32자-이상>
NEXT_PUBLIC_FASTAPI_URL=https://your-fastapi-domain.com
AUTH_DEMO_EMAIL=demo@vlooo.ai
AUTH_DEMO_PASSWORD=demo1234
```

**NEXTAUTH_SECRET 생성**:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 방법 2: Wrangler CLI 직접 배포

```bash
# 로그인
npx wrangler login

# 빌드 및 배포
npm run pages:deploy

# 또는 수동으로
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=vlooo
```

---

## ✅ 배포 후 확인 체크리스트

### 1) 빌드 로그 확인
- Cloudflare Dashboard → Pages → Deployments → 최신 배포 클릭
- 빌드 에러 없는지 확인
- 경고 메시지 검토

### 2) 주요 페이지 접속 테스트
- [ ] **홈페이지** (`/`) - 히어로 섹션 렌더링 확인
- [ ] **변환 페이지** (`/convert`) - 6단계 UI 표시 확인
- [ ] **로그인** (`/login`) - 폼 동작 확인
- [ ] **가격** (`/pricing`) - 요금제 표시 확인
- [ ] **대시보드** (`/dashboard`) - 인증 후 접근 가능 확인

### 3) 기능 테스트
- [ ] **파일 업로드** - PPT 드래그앤드롭 동작
- [ ] **네비게이션** - 메뉴 클릭 시 페이지 이동
- [ ] **로그인/로그아웃** - 세션 유지 확인
- [ ] **반응형 디자인** - 모바일/태블릿 뷰 확인

### 4) API 연결 확인
- [ ] FastAPI 백엔드 연결 상태
- [ ] CORS 설정 확인
- [ ] 환경 변수 올바른 값 적용 여부

---

## 🔍 문제 해결 (Troubleshooting)

### 문제 1: 메뉴 클릭 시 페이지 이동 안됨
**원인**: Next.js Link 컴포넌트가 Cloudflare Workers 환경에서 제대로 작동하지 않음

**해결**:
```typescript
// src/components/Navigation.tsx에서
import Link from 'next/link';  // ✓ 이미 사용 중

// 또는 client-side navigation 강제
<Link href="/convert" prefetch={false}>
```

### 문제 2: PPT 파일 업로드 실패
**원인**: 
- FastAPI 백엔드 URL이 잘못 설정됨
- CORS 정책 위반
- Request body size 제한

**해결**:
1. **환경 변수 확인**:
   ```bash
   # Cloudflare Dashboard → Pages → Settings → Environment variables
   NEXT_PUBLIC_FASTAPI_URL=https://your-api.com
   ```

2. **FastAPI CORS 설정** (`backend/main.py`):
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-domain.pages.dev"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **파일 크기 제한 확인**:
   - Cloudflare Pages: 최대 25MB 업로드
   - FastAPI: `max_upload_size` 설정

### 문제 3: 환경 변수가 적용되지 않음
**원인**: Cloudflare Pages는 빌드 시점에 환경 변수를 번들에 포함

**해결**:
1. Cloudflare Dashboard에서 환경 변수 설정 후 **재배포** 필수
2. `NEXT_PUBLIC_*` 접두어 확인 (클라이언트에서 접근 가능)
3. 서버 전용 변수는 접두어 없이 사용

### 문제 4: 빌드 실패 (Module not found)
**원인**: `@cloudflare/next-on-pages` 호환성 문제

**해결**:
```bash
# package.json dependencies 확인
npm install --save-dev @cloudflare/next-on-pages@latest

# Node 모듈 재설치
rm -rf node_modules package-lock.json
npm install
npm run pages:build
```

### 문제 5: Runtime 에러 (Dynamic imports)
**원인**: Cloudflare Workers는 일부 Node.js API 미지원

**해결**:
- `nodejs_compat` compatibility flag 활성화 (wrangler.toml에 이미 설정됨)
- 또는 해당 기능을 FastAPI 백엔드로 이동

---

## 📊 배포 상태

### ✅ 완료된 설정
- [x] Next.js Cloudflare Adapter 설치
- [x] wrangler.toml 설정
- [x] 빌드 스크립트 추가 (`pages:build`, `pages:deploy`)
- [x] 이미지 로더 설정
- [x] 환경 변수 템플릿 생성

### 🔧 진행 필요
- [ ] Cloudflare Pages 프로젝트 생성
- [ ] GitHub 연동 설정
- [ ] 프로덕션 환경 변수 설정
- [ ] FastAPI 백엔드 배포 (별도)
- [ ] 커스텀 도메인 연결

---

## 🌐 FastAPI 백엔드 배포 (별도 필요)

Cloudflare Pages는 **정적 프론트엔드만** 호스팅합니다.  
FastAPI 백엔드는 다음 중 하나로 배포:

### 옵션 1: Cloudflare Workers (Python 미지원)
❌ Python FastAPI는 Cloudflare Workers에서 직접 실행 불가

### 옵션 2: 외부 서버 (권장)
✅ **Railway.app**: https://railway.app
✅ **Render.com**: https://render.com
✅ **Google Cloud Run**: https://cloud.google.com/run
✅ **AWS Lambda + API Gateway**: https://aws.amazon.com/lambda

**Railway 배포 예시**:
```bash
# backend/ 디렉토리에서
echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > Procfile
git add backend/
git push railway main
```

---

## 🚀 배포 자동화 (GitHub Actions)

`.github/workflows/deploy.yml` 생성:

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
        run: npm run pages:build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: vlooo
          directory: .vercel/output/static
```

**GitHub Secrets 설정** (Repository → Settings → Secrets):
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `NEXT_PUBLIC_API_URL`
- `NEXTAUTH_SECRET`

---

## 📝 최종 체크리스트

### 배포 전
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음
- [ ] 로컬에서 `npm run pages:build` 성공
- [ ] 로컬에서 `npm run cf:preview` 테스트 완료

### Cloudflare 설정
- [ ] Cloudflare Pages 프로젝트 생성
- [ ] GitHub 리포지토리 연결
- [ ] 빌드 설정: `npm run pages:build`
- [ ] 출력 디렉토리: `.vercel/output/static`
- [ ] 환경 변수 모두 설정

### 배포 후
- [ ] 모든 페이지 접속 테스트
- [ ] 네비게이션 동작 확인
- [ ] FastAPI 연결 확인
- [ ] 모바일 반응형 확인

---

## 📞 지원

**문제 발생 시**:
1. Cloudflare Dashboard → Pages → Deployments → Logs 확인
2. 브라우저 개발자 도구 Console 확인
3. GitHub Issues에 에러 로그 첨부하여 문의

**관련 문서**:
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
- [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)

---

**최종 업데이트**: 2026년 2월 9일  
**현재 상태**: Cloudflare Adapter 설정 완료 ✅
