# Vlooo 프로덕션 배포 가이드

## 📋 목차
1. [배포 아키텍처](#배포-아키텍처)
2. [프론트엔드 배포 (Cloudflare Pages)](#프론트엔드-배포)
3. [백엔드 배포 (Cloudflare Workers/VPS)](#백엔드-배포)
4. [환경 변수 설정](#환경-변수-설정)
5. [데이터베이스 & 스토리지](#데이터베이스--스토리지)
6. [모니터링 & 로깅](#모니터링--로깅)

---

## 🏗️ 배포 아키텍처

```
[사용자] 
   ↓
[Cloudflare Pages] ← Next.js 프론트엔드
   ↓
[Cloudflare Workers / VPS] ← FastAPI 백엔드
   ↓
[Cloudflare R2] ← PPT/Video 파일 스토리지
```

### 권장 배포 옵션

| 컴포넌트 | 추천 플랫폼 | 대안 |
|---------|-----------|-----|
| 프론트엔드 | Cloudflare Pages | Vercel, Netlify |
| 백엔드 API | VPS (GPU 필요) | Railway, Render |
| 파일 스토리지 | Cloudflare R2 | AWS S3 |
| AI 모델 | 전용 GPU 서버 | Replicate API |

---

## 🌐 프론트엔드 배포 (Cloudflare Pages)

### 1. GitHub 연결
```bash
# GitHub에 푸시
git push origin main
```

### 2. Cloudflare Pages 설정
1. Cloudflare 대시보드 → Pages → "Create a project"
2. GitHub 저장소 선택: `Vlooo`
3. 빌드 설정:
   ```
   Build command: npm run build
   Build output directory: .next
   Root directory: /
   ```

### 3. 환경 변수 설정 (Cloudflare Pages)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_FASTAPI_URL=https://api.yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=[generate-strong-secret]
AUTH_DEMO_EMAIL=demo@yourdomain.com
AUTH_DEMO_PASSWORD=[secure-password]
```

### 4. 커스텀 도메인 연결
- Cloudflare Pages → Settings → Custom domains
- `yourdomain.com` 추가

---

## 🖥️ 백엔드 배포

### Option A: VPS (권장 - GPU 지원)

#### 1. VPS 서버 선택
- **AWS EC2**: g4dn.xlarge (GPU)
- **Google Cloud**: n1-standard-4 + T4 GPU
- **DigitalOcean**: GPU Droplet
- **Linode**: GPU Instances

#### 2. 서버 설정 (Ubuntu 22.04)
```bash
# 1. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 2. Python 3.10+ 설치
sudo apt install python3.10 python3-pip -y

# 3. FFmpeg 설치
sudo apt install ffmpeg -y

# 4. Ollama 설치 (로컬 LLM)
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.1

# 5. 프로젝트 클론
git clone https://github.com/yourusername/Vlooo.git
cd Vlooo/backend

# 6. Python 의존성 설치
pip3 install -r requirements.txt

# 7. 환경 변수 설정
cp .env.production.example .env.production
nano .env.production
```

#### 3. `.env.production` 설정
```dotenv
FASTAPI_PORT=8001
FASTAPI_URL=https://api.yourdomain.com
LOCAL_LLM_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
FFMPEG_PATH=/usr/bin/ffmpeg
CLOUDFLARE_R2_BUCKET=vlooo-media
CLOUDFLARE_R2_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY=[your-access-key]
CLOUDFLARE_R2_SECRET_KEY=[your-secret-key]
```

#### 4. Systemd 서비스 설정
```bash
# /etc/systemd/system/vlooo-backend.service
sudo nano /etc/systemd/system/vlooo-backend.service
```

```ini
[Unit]
Description=Vlooo FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/Vlooo/backend
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
EnvironmentFile=/home/ubuntu/Vlooo/backend/.env.production
ExecStart=/usr/bin/python3 main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 시작
sudo systemctl daemon-reload
sudo systemctl enable vlooo-backend
sudo systemctl start vlooo-backend

# 상태 확인
sudo systemctl status vlooo-backend
```

#### 5. Nginx 리버스 프록시
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/vlooo
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/vlooo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL 인증서 (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

### Option B: Cloudflare Workers (제한적)

⚠️ **제약사항**: 
- CPU 제한 (10ms ~ 50ms)
- FFmpeg 사용 불가
- Ollama 사용 불가
- 대용량 파일 처리 제한

**권장하지 않음** - VPS 사용 권장

---

## 💾 데이터베이스 & 스토리지

### Cloudflare R2 설정

#### 1. R2 버킷 생성
```bash
# Cloudflare 대시보드 → R2 → Create bucket
# 버킷 이름: vlooo-media
```

#### 2. API 토큰 생성
- R2 → Manage R2 API Tokens → Create API Token
- 권한: Read & Write
- 토큰 저장: `CLOUDFLARE_R2_ACCESS_KEY`, `CLOUDFLARE_R2_SECRET_KEY`

#### 3. 백엔드 코드에서 R2 연결
```python
# backend/app/services/storage.py
import boto3

s3 = boto3.client(
    's3',
    endpoint_url=os.getenv('CLOUDFLARE_R2_ENDPOINT'),
    aws_access_key_id=os.getenv('CLOUDFLARE_R2_ACCESS_KEY'),
    aws_secret_access_key=os.getenv('CLOUDFLARE_R2_SECRET_KEY'),
)
```

---

## 📊 모니터링 & 로깅

### 1. 로그 수집 (Systemd)
```bash
# 백엔드 로그 확인
sudo journalctl -u vlooo-backend -f

# 로그 파일로 저장
sudo journalctl -u vlooo-backend > /var/log/vlooo-backend.log
```

### 2. 성능 모니터링
```bash
# CPU, 메모리 사용량
htop

# 디스크 사용량
df -h

# 네트워크 사용량
iftop
```

### 3. Uptime 모니터링
- **UptimeRobot**: https://uptimerobot.com/
- **Pingdom**: https://www.pingdom.com/
- API 엔드포인트 모니터링: `https://api.yourdomain.com/api/health`

---

## 🔒 보안 체크리스트

- [ ] `.env.production` 파일이 `.gitignore`에 포함됨
- [ ] NEXTAUTH_SECRET이 강력한 랜덤 문자열
- [ ] API 인증 미들웨어 활성화
- [ ] HTTPS 인증서 설치 (Let's Encrypt)
- [ ] CORS 설정 확인 (프로덕션 도메인만 허용)
- [ ] 파일 업로드 크기 제한 설정
- [ ] Rate Limiting 활성화

---

## 🚀 배포 체크리스트

### 프론트엔드
- [ ] 환경 변수 설정 완료
- [ ] 빌드 성공 확인
- [ ] 커스텀 도메인 연결
- [ ] SSL 인증서 활성화

### 백엔드
- [ ] VPS 서버 설정 완료
- [ ] Ollama 설치 및 모델 다운로드
- [ ] FFmpeg 설치 확인
- [ ] Systemd 서비스 실행 중
- [ ] Nginx 리버스 프록시 설정
- [ ] SSL 인증서 설치

### 스토리지
- [ ] Cloudflare R2 버킷 생성
- [ ] API 토큰 발급
- [ ] 백엔드에서 R2 연결 테스트

### 모니터링
- [ ] Uptime 모니터링 설정
- [ ] 로그 수집 확인
- [ ] 백업 전략 수립

---

## 📞 문제 발생 시

1. **백엔드 로그 확인**: `sudo journalctl -u vlooo-backend -f`
2. **프론트엔드 로그**: Cloudflare Pages → Deployments → 빌드 로그
3. **Nginx 로그**: `/var/log/nginx/error.log`
4. **서버 재시작**: `sudo systemctl restart vlooo-backend`

---

**이전 단계**: [SETUP.md](./SETUP.md) - 로컬 개발 환경 설정
