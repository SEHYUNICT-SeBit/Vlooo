/**
 * API 요청/응답 타입 정의
 * Vlooo API 통신에 사용되는 모든 타입을 중앙화
 */

/**
 * ===== 공통 응답 타입 =====
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * ===== 파일 업로드 (PPT) =====
 */
export interface UploadRequest {
  file: File;
  projectName?: string;
  description?: string;
}

export interface UploadResponse {
  fileId: string;
  filename: string;
  fileSize: number;
  uploadedAt: string;
  presignedUrl?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * ===== PPT 파싱 & 슬라이드 추출 =====
 */
export interface Slide {
  slideId: string;
  slideNumber: number;
  title?: string;
  content: string;
  imageUrls: string[];
  notes?: string;
}

export interface ParsePptRequest {
  fileId: string;
}

export interface ParsePptResponse {
  projectId: string;
  totalSlides: number;
  slides: Slide[];
  extractedText: string;
  metadata: {
    pptTitle?: string;
    pptAuthor?: string;
    createdAt?: string;
  };
}

/**
 * ===== AI 스크립트 생성 =====
 */
export interface ScriptGenerationRequest {
  projectId: string;
  slides: Slide[];
  toneOfVoice?: 'professional' | 'friendly' | 'casual'; // 기본값: professional
  language?: 'ko' | 'en'; // 기본값: ko
  customInstructions?: string;
}

export interface GeneratedScript {
  slideId: string;
  slideNumber: number;
  scriptText: string;
  duration?: number; // 예상 음성 길이 (초)
  keywords?: string[];
}

export interface ScriptGenerationResponse {
  projectId: string;
  scripts: GeneratedScript[];
  totalDuration?: number;
  generatedAt: string;
}

/**
 * ===== TTS (음성 합성) =====
 */
export interface TtsRequest {
  projectId: string;
  scripts: GeneratedScript[];
  voiceId?: string; // ElevenLabs voice ID
  voiceName?: string; // e.g., "Professional Male", "Professional Female"
  speed?: number; // 0.5 - 2.0, 기본값: 1.0
}

export interface TtsResponse {
  projectId: string;
  audioUrls: {
    slideId: string;
    slideNumber: number;
    audioUrl: string;
    duration: number; // 초
  }[];
  totalDuration: number;
  generatedAt: string;
}

/**
 * ===== 비디오 렌더링 =====
 */
export interface VideoRenderRequest {
  projectId: string;
  slides: Slide[];
  audioUrls: TtsResponse['audioUrls'];
  resolution?: '720p' | '1080p' | '4k'; // 기본값: 1080p
  fps?: number; // 기본값: 30
  outputFormat?: 'mp4' | 'webm'; // 기본값: mp4
}

export interface VideoRenderResponse {
  projectId: string;
  videoUrl: string;
  videoSize: number; // bytes
  duration: number; // 초
  resolution: string;
  renderStatus: 'completed' | 'processing' | 'failed';
  completedAt?: string;
}

/**
 * ===== 프로젝트 상태 & 진행률 =====
 */
export type ConversionStep =
  | 'upload'
  | 'parsing'
  | 'scripting'
  | 'voice-synthesis'
  | 'rendering'
  | 'completed';

export interface ProjectStatus {
  projectId: string;
  currentStep: ConversionStep;
  progress: number; // 0-100
  metadata: {
    uploadedAt: string;
    filename: string;
    totalSlides: number;
  };
  results?: {
    scriptUrl?: string;
    audioUrl?: string;
    videoUrl?: string;
  };
  error?: {
    step: ConversionStep;
    message: string;
    code: string;
  };
}

/**
 * ===== 에러 타입 =====
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ErrorResponse {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * ===== 변환 컨텍스트 (프론트엔드 상태) =====
 */
export interface ConversionContextState {
  projectId?: string;
  currentStep: ConversionStep;
  uploadedFile?: {
    name: string;
    size: number;
  };
  slides?: Slide[];
  scripts?: GeneratedScript[];
  selectedVoiceId?: string;
  audioUrls?: TtsResponse['audioUrls'];
  videoUrl?: string;
  progress: number;
  error?: string;
  loading: boolean;
}
