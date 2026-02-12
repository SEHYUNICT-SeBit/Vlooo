# 🚀 Cloudflare Pages 배포 실행 가이드

> **상태**: Vlooo MVP 프로덕션 배포 시작  
> **배포일**: 2026-02-12  
> **목표**: Cloudflare Pages에 Next.js 배포

---

## 📋 배포 전 체크리스트

### ✅ 로컬 준비 완료
- [x] 모든 코드 GitHub에 푸시 완료
- [x] `.env.production` 작성 완료
- [x] NEXTAUTH_SECRET 생성 (32자)
- [x] TypeScript/ESLint 0 에러

**GitHub Commit 확인:**
```bash
$ git log --oneline -1
7ad40ff docs: 로컬 검증 완료 및 프로덕션 배포 가이드 작성
```

---

## 🌐 Step 1: Cloudflare 계정 준비

### 1-1: Cloudflare 로그인
1. https://dash.cloudflare.com 접속
2. 계정 로그인 (없으면 가입)

### 1-2: Pages 섹션 접근
1. 좌측 메뉴에서 **Pages** 클릭
2. **Create a project** 버튼 클릭

---

## 🔗 Step 2: GitHub 연동

### 2-1: "Connect to Git" 선택
![Cloudflare Pages 생성 화면]
1. **"Connect to Git"** 버튼 클릭
2. GitHub 로그인 (팝업)
3. Vlooo 리포지토리 선택

### 2-2: 리포지토리 선택
- **Owner**: SEHYUNICT-SeBit
- **Repository**: Vlooo
- **Branch**: main

✅ **선택 후 "Begin setup" 클릭**

---

## ⚙️ Step 3: 빌드 설정

### 3-1: 빌드 설정 입력
```
Framework preset: Next.js
Build command: npm run pages:build
Build output directory: .vercel/output/static
Root directory: (빈 상태 유지)
Environment variables: (다음 단계 이후)
```

**중요**: "Build output directory"는 정확히 `.vercel/output/static` 입력!

### 3-2: Save 버튼 클릭
- 저장하면 첫 번째 배포가 시작됨

---

## 🔐 Step 4: 환경 변수 설정

### ⚠️ 중요: 배포 시작 BEFORE 환경 변수 설정

배포 시작 전에 환경 변수를 설정해야 합니다.

### 4-1: 환경 변수 페이지 접근
페이지 생성 후:
1. 프로젝트명 클릭
2. **Settings** tab → **Environment variables**

### 4-2: 환경 변수 추가 (Production)

**다음 변수들을 추가:**

| 변수명 | 값 | 용도 |
|--------|------|------|
| `NEXT_PUBLIC_APP_ENV` | `production` | 앱 환경 |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8001` | API 엔드포인트 |
| `NEXT_PUBLIC_FASTAPI_URL` | `http://localhost:8001` | FastAPI URL |
| `NEXTAUTH_URL` | `http://localhost:3000` | 인증 리다이렉트 |
| `NEXTAUTH_SECRET` | `reFUR6dkwq6J4NumII0Km9kjucrpdNmzAfwY+gYkyRY=` | 인증 비밀키 |

### 4-3: 각 변수 추가 방법
1. **"Add variable"** 클릭
2. **Variable name** 입력
3. **Value** 입력
4. **Production** 환경 선택 (중요!)
5. **Save** 클릭

**✅ 모두 Production 환경에 설정할 것!**

---

## 🚀 Step 5: 배포 실행

### 5-1: 자동 배포 (권장)
```bash
# 로컬에서
cd c:\vibe\Vlooo
git push

# Cloudflare가 자동으로 감지하고 배포 시작
```

### 5-2: 수동 배포 (대안)
```bash
# Wrangler CLI로 수동 배포
npm run pages:deploy
```

### 5-3: 배포 진행 상황 확인
1. Cloudflare Dashboard → Pages → Vlooo
2. **Deployments** tab 클릭
3. 최신 배포 클릭하여 로그 확인

**배포 완료 시 상태:**
```
✅ Status: ACTIVE (배포 완료)
✅ Preview URL 생성됨
```

---

## ✅ Step 6: 배포 후 검증

### 6-1: 배포 URL 확인
```
Production URL: https://vlooo.pages.dev
또는 프로젝트명-랜덤.pages.dev
```

### 6-2: 모든 페이지 테스트
```
홈페이지:       https://vlooo.pages.dev
대시보드:       https://vlooo.pages.dev/dashboard
로그인:        https://vlooo.pages.dev/login
프라이싱:      https://vlooo.pages.dev/pricing
```

**확인 사항:**
- [ ] 페이지 로드됨
- [ ] 네비게이션 작동
- [ ] 스타일 적용됨
- [ ] 반응형 디자인 정상

### 6-3: DevTools 확인
```
F12 → Console:
- 빨간색 에러 없음
- 경고 최소화

F12 → Network:
- 404/500 에러 없음
- API 호출 상태 확인
```

### 6-4: API 연동 확인
```
만약 API 연결 실패 시:
- NEXT_PUBLIC_FASTAPI_URL 확인
- FastAPI 백엔드가 실제로 배포되었는지 확인
- CORS 설정 확인
```

---

## 🔧 문제 해결 (Troubleshooting)

### 빌드 실패
```
Cloudflare Deployments → 최신 배포 → Build log 클릭
```

**일반적인 원인:**
1. Node 버전 부정합
2. 종속성 설치 실패
3. TypeScript 컴파일 에러

**해결:**
```bash
# 로컬에서 빌드 테스트
rm -rf .vercel
npm run pages:build

# 오류 있으면 수정 후 커밋/푸시
git add .
git commit -m "fix: build error"
git push
```

### 환경 변수 적용 안됨
```
배포 후에 환경 변수를 설정했으면: 재배포 필요!

Deployments → 최신 배포 → "Retry deployment" 클릭
또는
git push를 다시 실행
```

### API 422 오류
```
NEXT_PUBLIC_FASTAPI_URL이 실제 FastAPI 주소인지 확인
```

---

## 📊 배포 완료 체크리스트

### 빌드 성공
- [ ] Deployments → Status: ACTIVE
- [ ] Preview URL 생성됨
- [ ] Build log: Success

### 기능 검증
- [ ] 홈페이지 렌더링 정상
- [ ] 대시보드 접근 가능
- [ ] 로그인 모달 동작
- [ ] 네비게이션 정상

### 성능 확인
- [ ] 페이지 로드 시간 <3초
- [ ] Console 에러 0개
- [ ] Network 404/500 없음

### API 연동
- [ ] NEXT_PUBLIC_FASTAPI_URL 정상
- [ ] FastAPI 백엔드 연동 확인
- [ ] CORS 설정 정상

---

## 🎯 다음 단계 (배포 후)

### 1️⃣ 커스텀 도메인 설정 (선택사항)
```
Settings → Custom domain → yourdomain.com
```

### 2️⃣ FastAPI 백엔드 배포 (필요)
⚠️ Cloudflare Pages는 정적 프론트엔드만 호스팅!
- Railway, Render, Google Cloud Run 중 선택
- FastAPI 배포 후 NEXT_PUBLIC_FASTAPI_URL 업데이트

### 3️⃣ 모니터링 설정 (권장)
```
Sentry, LogRocket 등 오류 모니터링 도구 설정
```

### 4️⃣ Phase 2 개발 시작
- 추가 기능 개발
- 성능 최적화
- UI/UX 개선

---

## 📞 배포 중 문제 발생

### Cloudflare Dashboard 확인
```
1. Pages → Vlooo 프로젝트
2. Deployments tab → 최신 배포 클릭
3. "View build log" 링크 확인
```

### 일반적인 에러 메시지

| 에러 | 원인 | 해결 |
|------|------|------|
| `npm ERR!` | 종속성 설치 실패 | package-lock.json 확인 |
| `tsc error` | TypeScript 컴파일 에러 | 로컬 type-check 실행 |
| `Module not found` | import 경로 오류 | import 경로 확인 |
| `CORS error` | API 호출 실패 | NEXT_PUBLIC_FASTAPI_URL 확인 |

---

## 🎉 배포 완료!

### 축하합니다! 🎊
Vlooo MVP가 **Cloudflare Pages에 배포**되었습니다!

**배포 URL:**
```
https://vlooo.pages.dev (또는 설정한 커스텀 도메인)
```

### 공유 방법
```
- 팀원: 배포 URL 공유
- 투자자: 실제 작동하는 데모 제시
- 사용자: 베타 테스트 시작
```

---

**배포 완료일**: 2026-02-12  
**상태**: ✅ Production Live  
**다음 단계**: FastAPI 백엔드 배포 + Phase 2 개발
