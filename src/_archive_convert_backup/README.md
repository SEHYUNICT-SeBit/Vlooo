# Convert Page Backup (2026-02-12)

> **백업 이유**: `/convert` 페이지를 제거하고 홈 페이지에서 직접 변환을 시작하도록 UI 플로우 변경

## 백업 파일

- `page.tsx` - 기존 변환 페이지 로직 전체

## 주요 기능

### 1. 파일 업로드 처리
- FileUploader 컴포넌트 사용
- pendingFile (FileContext)에서 자동 전환

### 2. 변환 단계별 처리
```typescript
// 단계 순서
upload → parsing → scripting → voice-synthesis → rendering → completed
```

### 3. 핵심 로직

#### PPT 파싱
- `apiClient.parsePpt(uploadFile)`
- 결과: `projectId`, `slides[]`

#### 스크립트 생성
- `apiClient.generateScript(projectId, slides)`
- Ollama (Llama 3.1:8b) 또는 OpenAI 폴백
- 결과: `scripts[]`

#### TTS 음성 합성
- `apiClient.generateTts(projectId, scripts, selectedVoiceId)`
- Google TTS (gTTS)
- 결과: `audioUrls[]`

#### 비디오 렌더링
- `apiClient.renderVideo(projectId, slides, audioUrls)`
- FFmpeg
- 결과: `videoUrl`

### 4. 프로젝트 상태 폴링
- `/api/project-status/{projectId}` - 3초마다 호출
- `detailedProgress` 업데이트 (1/11, 2/11...)

### 5. 체크포인트 복구
- 백엔드 재시작 시 진행 상태 복구
- `stageResults`에서 완료된 단계 확인
- 실패 단계부터 재시도

## 재사용 방법

필요 시 이 파일의 로직을 다음 위치로 이동:
- `src/hooks/useConversion.ts` (Custom Hook)
- `src/components/AppLayout.tsx` (직접 처리)
- 또는 새로운 변환 관리 컴포넌트

## 참고

- ConversionStore: `src/context/ConversionStore.ts`
- FileContext: `src/context/FileContext.tsx`
- API Client: `src/services/api.ts`
