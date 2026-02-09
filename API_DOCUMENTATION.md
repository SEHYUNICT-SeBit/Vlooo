# Vlooo API 라우트 구조 및 문서

## 📋 API 엔드포인트 목록

### 1️⃣ **파일 업로드**
```
POST /api/upload
```
**설명**: PPT 파일을 업로드하고 Cloudflare R2에 저장

**요청**:
```typescript
Content-Type: multipart/form-data
{
  file: File         // PPT 파일 (필수)
  projectName?: string  // 프로젝트 이름 (선택)
  description?: string  // 설명 (선택)
}
```

**응답** (201 Created):
```typescript
{
  success: true,
  data: {
    fileId: string;           // 고유 파일 ID
    filename: string;         // 원본 파일명
    fileSize: number;         // 파일 크기 (bytes)
    uploadedAt: string;       // ISO 8601 타임스탐프
  }
}
```

**에러 코드**:
- `INPUT_003`: 지원하지 않는 파일 형식
- `INPUT_004`: 파일 크기 초과 (100MB 제한)
- `FILE_001`: 파일 업로드 실패

---

### 2️⃣ **PPT 파싱**
```
POST /api/parse-ppt
```
**설명**: 업로드된 PPT 파일을 분석하여 슬라이드, 텍스트, 이미지 추출

**요청**:
```typescript
{
  fileId: string  // 업로드된 파일 ID (필수)
}
```

**응답** (200 OK):
```typescript
{
  success: true,
  data: {
    projectId: string;                  // 프로젝트 고유 ID
    totalSlides: number;                // 총 슬라이드 개수
    slides: Array<{
      slideId: string;
      slideNumber: number;
      title?: string;
      content: string;                  // 추출된 텍스트
      imageUrls: string[];              // 이미지 URL 목록
      notes?: string;                   // 발표자 노트
    }>;
    extractedText: string;              // 전체 텍스트
    metadata: {
      pptTitle?: string;
      pptAuthor?: string;
      createdAt?: string;
    };
  }
}
```

**에러 코드**:
- `FILE_002`: 파일을 찾을 수 없음
- `FILE_003`: 파일 파싱 실패
- `PPT_002`: 슬라이드를 찾을 수 없음

---

### 3️⃣ **AI 스크립트 생성**
```
POST /api/generate-script
```
**설명**: 슬라이드 콘텐츠를 바탕으로 IT 전문가 나레이션 스크립트 생성

**요청**:
```typescript
{
  projectId: string;           // 프로젝트 ID (필수)
  slides: Array<{              // 슬라이드 배열 (필수)
    slideId: string;
    slideNumber: number;
    title?: string;
    content: string;
    imageUrls: string[];
  }>;
  toneOfVoice?: 'professional' | 'friendly' | 'casual';  // 기본값: professional
  language?: 'ko' | 'en';                                 // 기본값: ko
  customInstructions?: string;                            // 추가 지시사항
}
```

**응답** (200 OK):
```typescript
{
  success: true,
  data: {
    projectId: string;
    scripts: Array<{
      slideId: string;
      slideNumber: number;
      scriptText: string;      // 생성된 나레이션 스크립트
      duration?: number;       // 예상 음성 길이 (초)
      keywords?: string[];     // 주요 키워드
    }>;
    totalDuration?: number;    // 총 예상 길이 (초)
    generatedAt: string;       // ISO 8601 타임스탐프
  }
}
```

**에러 코드**:
- `AI_001`: 스크립트 생성 실패
- `AI_002`: OpenAI API 오류
- `AI_003`: 처리 시간 초과

---

### 4️⃣ **TTS 음성 합성**
```
POST /api/generate-tts
GET  /api/generate-tts        // 사용 가능한 음성 목록 조회
```
**설명**: 스크립트 텍스트를 ElevenLabs TTS로 음성으로 변환

**요청**:
```typescript
{
  projectId: string;           // 프로젝트 ID (필수)
  scripts: Array<{             // 스크립트 배열 (필수)
    slideId: string;
    slideNumber: number;
    scriptText: string;
    duration?: number;
  }>;
  voiceId?: string;            // ElevenLabs 음성 ID
  voiceName?: string;          // 음성 이름 (예: "Professional Male")
  speed?: number;              // 음성 속도 (0.5 ~ 2.0, 기본값: 1.0)
}
```

**응답** (200 OK):
```typescript
{
  success: true,
  data: {
    projectId: string;
    audioUrls: Array<{
      slideId: string;
      slideNumber: number;
      audioUrl: string;        // MP3 음성 파일 URL
      duration: number;        // 음성 길이 (초)
    }>;
    totalDuration: number;     // 전체 음성 길이 (초)
    generatedAt: string;
  }
}
```

**사용 가능한 음성 (GET /api/generate-tts)**:
```typescript
{
  success: true,
  data: {
    voices: Array<{
      id: string;              // 음성 ID
      name: string;            // 음성 이름
      gender: 'male' | 'female';
      accent: string;          // 억양 (korean, american, etc.)
      description: string;     // 음성 설명
    }>;
    total: number;
  }
}
```

**에러 코드**:
- `TTS_001`: 음성 합성 실패
- `TTS_002`: ElevenLabs API 오류
- `TTS_003`: 음성을 찾을 수 없음

---

### 5️⃣ **비디오 렌더링**
```
POST /api/render-video
```
**설명**: 슬라이드, 음성, 효과를 조합하여 최종 비디오 생성

**요청**:
```typescript
{
  projectId: string;           // 프로젝트 ID (필수)
  slides: Array<{              // 슬라이드 배열 (필수)
    slideId: string;
    slideNumber: number;
    title?: string;
    content: string;
    imageUrls: string[];
  }>;
  audioUrls: Array<{           // 음성 URL 배열 (필수)
    slideId: string;
    slideNumber: number;
    audioUrl: string;
    duration: number;
  }>;
  resolution?: '720p' | '1080p' | '4k';  // 기본값: 1080p
  fps?: number;                           // 기본값: 30
  outputFormat?: 'mp4' | 'webm';         // 기본값: mp4
}
```

**응답** (202 Accepted - 비동기 처리):
```typescript
{
  success: true,
  data: {
    projectId: string;
    videoUrl: string;          // 최종 비디오 URL
    videoSize: number;         // 파일 크기 (bytes)
    duration: number;          // 비디오 길이 (초)
    resolution: string;        // 해상도
    renderStatus: 'processing' | 'completed' | 'failed';
    completedAt?: string;      // 완료 시간
  }
}
```

**에러 코드**:
- `VIDEO_001`: 비디오 렌더링 실패
- `VIDEO_002`: FFmpeg 오류
- `VIDEO_003`: 처리 시간 초과

---

### 6️⃣ **프로젝트 상태 조회**
```
GET /api/project-status/{projectId}
```
**설명**: 변환 프로세스의 진행 상황 및 상태 조회

**응답** (200 OK):
```typescript
{
  success: true,
  data: {
    projectId: string;
    currentStep: 'upload' | 'parsing' | 'scripting' | 'voice-synthesis' | 'rendering' | 'completed';
    progress: number;          // 0-100
    metadata: {
      uploadedAt: string;      // ISO 8601 타임스탐프
      filename: string;        // 업로드된 파일명
      totalSlides: number;     // 슬라이드 개수
    };
    results?: {                // 완료된 단계의 결과물
      scriptUrl?: string;
      audioUrl?: string;
      videoUrl?: string;
    };
    error?: {                  // 에러 발생 시
      step: string;
      message: string;
      code: string;
    };
  }
}
```

---

## 🚀 클라이언트 사용 예시

```typescript
import { apiClient } from '@/services/api';
import { useConversionStore } from '@/context/ConversionStore';

export default function ConversionPage() {
  const { setProjectId, setCurrentStep, setProgress } = useConversionStore();

  const handleConversion = async (file: File) => {
    try {
      // 1. 파일 업로드
      setCurrentStep('upload');
      const uploadResponse = await apiClient.uploadFile(file, 'My Project', (progress) => {
        setProgress(progress.percentage);
      });

      // 2. PPT 파싱
      setCurrentStep('parsing');
      const parseResponse = await apiClient.parsePpt(uploadResponse.fileId);
      setProjectId(parseResponse.projectId);

      // 3. 스크립트 생성
      setCurrentStep('scripting');
      const scriptResponse = await apiClient.generateScript(
        parseResponse.projectId,
        parseResponse.slides,
        { toneOfVoice: 'professional' }
      );

      // 4. TTS 음성 생성
      setCurrentStep('voice-synthesis');
      const ttsResponse = await apiClient.generateTts(
        parseResponse.projectId,
        scriptResponse.scripts,
        { voiceName: 'Professional Male' }
      );

      // 5. 비디오 렌더링
      setCurrentStep('rendering');
      const videoResponse = await apiClient.renderVideo(
        parseResponse.projectId,
        parseResponse.slides,
        ttsResponse.audioUrls,
        { resolution: '1080p' }
      );

      // 6. 완료
      setCurrentStep('completed');
      console.log('최종 비디오:', videoResponse.videoUrl);
    } catch (error) {
      console.error('변환 실패:', error);
    }
  };

  return (
    <div>
      <button onClick={() => document.querySelector('input[type="file"]')?.click()}>
        파일 선택
      </button>
      <input
        type="file"
        hidden
        onChange={(e) => e.target.files?.[0] && handleConversion(e.target.files[0])}
      />
    </div>
  );
}
```

---

## ⚙️ 환경 변수 설정

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
CLOUDFLARE_R2_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
```

---

## 📊 에러 처리 표준

모든 에러 응답은 다음 형식을 따릅니다:

```typescript
{
  success: false,
  error: {
    code: string;        // 에러 코드 (예: INPUT_001)
    message: string;     // 사용자 친화적 메시지
    details?: {          // 추가 정보 (선택사항)
      field?: string;    // 어느 필드에서 발생했는지
      [key: string]: any;
    };
  },
  timestamp: string;     // ISO 8601 타임스탐프
}
```

---

## 🔄 프로세스 흐름

```
Client Upload
    ↓
Server: Upload to R2
    ↓
Parse PPT (python-pptx)
    ↓
Generate Scripts (OpenAI)
    ↓
Synthesize Voice (ElevenLabs)
    ↓
Render Video (FFmpeg/Remotion)
    ↓
Store Result & Return URL
```

---

**마지막 업데이트**: 2026년 2월 9일
