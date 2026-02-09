# Vlooo Backend API

FastAPI 기반 PPT 파싱 및 처리 백엔드

## 🚀 빠른 시작

### 1. 환경 설정

```bash
cd backend
cp .env.example .env
```

`.env` 파일을 편집하여 환경 변수 설정:
```bash
CLOUDFLARE_R2_ENDPOINT=https://[ACCOUNT_ID].r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=vlooo-uploads
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 서버 실행

```bash
python main.py
```

또는:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

서버는 `http://localhost:8000`에서 실행됩니다.

## 📌 API 엔드포인트

### 1. PPT 파싱

```http
POST /api/parse-ppt
Content-Type: multipart/form-data

file: <pptx or ppt file>
```

**응답**:
```json
{
  "success": true,
  "data": {
    "projectId": "proj_abc123",
    "totalSlides": 10,
    "slides": [
      {
        "slideId": "slide_1",
        "slideNumber": 1,
        "title": "슬라이드 제목",
        "content": "슬라이드 내용",
        "imageUrls": [],
        "notes": "발표자 노트"
      }
    ],
    "extractedText": "전체 텍스트...",
    "metadata": {
      "pptTitle": "프레젠테이션 제목",
      "pptAuthor": "작성자",
      "createdAt": "2024-01-01T00:00:00"
    }
  },
  "timestamp": "2024-01-01T12:00:00"
}
```

### 2. 헬스 체크

```http
GET /api/health
```

**응답**:
```json
{
  "status": "healthy",
  "service": "ppt-parser",
  "version": "1.0.0"
}
```

### 3. API 상태

```http
GET /api/status
```

**응답**:
```json
{
  "status": "operational",
  "environment": "development",
  "services": {
    "ppt_parser": "ready",
    "r2_storage": true
  }
}
```

## 🏗️ 프로젝트 구조

```
backend/
├── main.py                 # FastAPI 애플리케이션 진입점
├── requirements.txt        # Python 의존성
├── .env.example           # 환경 변수 템플릿
└── app/
    ├── __init__.py
    ├── models.py          # Pydantic 모델
    ├── services/
    │   ├── ppt_parser.py  # PPT 파싱 로직
    │   └── r2_storage.py  # R2 스토리지 관리
    └── routes/
        ├── ppt.py        # PPT 처리 라우터
        └── __init__.py
```

## 🔧 개발

### 테스트 PPT 생성

```bash
# TODO: 테스트 PPT 생성 스크립트 작성
```

### 로깅

모든 로그는 콘솔에 출력됩니다. 개발 환경에서는:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📚 의존성

- **FastAPI**: 웹 프레임워크
- **uvicorn**: ASGI 서버
- **python-pptx**: PPT 파일 처리
- **Pillow**: 이미지 처리
- **boto3**: AWS S3 / Cloudflare R2 연동
- **pydantic**: 데이터 검증

## 🐛 트러블슈팅

### PPT 파싱 실패
- 파일이 손상되었는지 확인
- 지원되는 파일 형식인지 확인 (.ppt, .pptx)

### R2 업로드 실패
- 환경 변수 설정 확인
- 액세스 키 및 비밀키 확인
- 버킷 이름 확인

## 🚀 배포

### Cloudflare Workers로 배포

```bash
# TODO: Workers 배포 스크립트
```

### Docker로 배포

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📝 라이선스

MIT License
