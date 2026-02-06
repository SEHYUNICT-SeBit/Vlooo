# Cloudflare Pages 배포 체크리스트 (간단)

## 1) 사전 준비
- `.env` 또는 `.env.local` 파일에 실제 키를 저장하고 절대 커밋하지 마세요.
- 리포에 민감정보가 이미 커밋되어 있다면 `git rm --cached .env` 후 새 커밋을 만드세요.
- `.gitignore`에 `.env`와 `.env.local`이 포함되어 있는지 확인하세요.

## 2) 로컬 빌드 확인
```bash
npm ci
npm run build
```
- 빌드가 성공하면 배포 준비가 된 것입니다. 빌드 에러가 있으면 먼저 수정하세요.

## 3) GitHub 리포지토리 준비
- 새 리포를 생성하고 로컬에 `origin` 리모트를 추가한 뒤 푸시하세요:
```bash
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

## 4) Cloudflare Pages 설정
- Cloudflare Pages에서 새 프로젝트 생성 → Git 리포지토리 연결
- Framework preset: `Next.js` (또는 수동으로 설정)
- Build command: `npm run build`
- Build output directory: leave default for Next.js (`.next`) or follow Cloudflare 안내

## 5) 환경변수 설정 (Cloudflare의 UI에서)
- 서버 비밀키 (예): `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `CLOUDFLARE_R2_*`
- 클라이언트 변수는 `NEXT_PUBLIC_*` 접두어 사용: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ANALYTICS_ID`

## 6) 배포 후 확인
- 배포 로그 확인: 빌드 에러 / 런타임 에러 확인
- 주요 페이지: `/`, `/dashboard`, `/convert` 접속 확인
- API 통신(스크립트 생성, TTS 등) 테스트 (필요 시 로그·에러 메시지 확인)

## 7) 롤백 및 비상 대책
- 문제가 있으면 이전 커밋으로 롤백하거나 환경 변수를 잠깐 비활성화하세요.

---
추가로 원하시면 자동화된 GitHub Actions 워크플로(비밀값 설정 포함) 템플릿도 만들어 드리겠습니다.
