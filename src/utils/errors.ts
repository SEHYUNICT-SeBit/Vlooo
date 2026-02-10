/**
 * API 에러 처리 유틸리티
 * 표준화된 에러 생성 및 응답 처리
 */

import { NextResponse } from 'next/server';
import { ApiError, ApiResponse, ErrorResponse } from '@/types/api';

/**
 * API 에러 코드 정의
 */
export const ERROR_CODES = {
  // 인증 관련
  UNAUTHORIZED: 'AUTH_001',
  INVALID_TOKEN: 'AUTH_002',
  FORBIDDEN: 'AUTH_003',

  // 입력 검증
  INVALID_INPUT: 'INPUT_001',
  MISSING_REQUIRED_FIELD: 'INPUT_002',
  INVALID_FILE_TYPE: 'INPUT_003',
  FILE_TOO_LARGE: 'INPUT_004',

  // 파일 처리
  FILE_UPLOAD_FAILED: 'FILE_001',
  FILE_NOT_FOUND: 'FILE_002',
  FILE_PARSE_ERROR: 'FILE_003',

  // PPT 파싱
  PPT_PARSE_ERROR: 'PPT_001',
  NO_SLIDES_FOUND: 'PPT_002',

  // AI 스크립트 생성
  SCRIPT_GENERATION_FAILED: 'AI_001',
  OPENAI_API_ERROR: 'AI_002',
  SCRIPT_GENERATION_TIMEOUT: 'AI_003',

  // TTS 음성 생성
  TTS_GENERATION_FAILED: 'TTS_001',
  ELEVENLABS_API_ERROR: 'TTS_002',
  VOICE_NOT_FOUND: 'TTS_003',

  // 비디오 렌더링
  VIDEO_RENDER_FAILED: 'VIDEO_001',
  FFMPEG_ERROR: 'VIDEO_002',
  RENDER_TIMEOUT: 'VIDEO_003',

  // 스토리지
  STORAGE_ERROR: 'STORAGE_001',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_002',

  // 서버 에러
  INTERNAL_SERVER_ERROR: 'SERVER_001',
  SERVICE_UNAVAILABLE: 'SERVER_002',
  DATABASE_ERROR: 'SERVER_003',

  // 기타
  NOT_FOUND: 'NOT_FOUND_001',
  RESOURCE_CONFLICT: 'CONFLICT_001',
  RATE_LIMITED: 'RATE_001',
} as const;

/**
 * HTTP 상태 코드 매핑
 */
const statusCodeMap: Record<string, number> = {
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.INVALID_TOKEN]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.INVALID_INPUT]: 400,
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 400,
  [ERROR_CODES.INVALID_FILE_TYPE]: 400,
  [ERROR_CODES.FILE_TOO_LARGE]: 413,
  [ERROR_CODES.FILE_UPLOAD_FAILED]: 500,
  [ERROR_CODES.FILE_NOT_FOUND]: 404,
  [ERROR_CODES.FILE_PARSE_ERROR]: 400,
  [ERROR_CODES.PPT_PARSE_ERROR]: 400,
  [ERROR_CODES.NO_SLIDES_FOUND]: 400,
  [ERROR_CODES.SCRIPT_GENERATION_FAILED]: 500,
  [ERROR_CODES.OPENAI_API_ERROR]: 503,
  [ERROR_CODES.SCRIPT_GENERATION_TIMEOUT]: 504,
  [ERROR_CODES.TTS_GENERATION_FAILED]: 500,
  [ERROR_CODES.ELEVENLABS_API_ERROR]: 503,
  [ERROR_CODES.VOICE_NOT_FOUND]: 404,
  [ERROR_CODES.VIDEO_RENDER_FAILED]: 500,
  [ERROR_CODES.FFMPEG_ERROR]: 500,
  [ERROR_CODES.RENDER_TIMEOUT]: 504,
  [ERROR_CODES.STORAGE_ERROR]: 500,
  [ERROR_CODES.STORAGE_QUOTA_EXCEEDED]: 429,
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 500,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 503,
  [ERROR_CODES.DATABASE_ERROR]: 500,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.RESOURCE_CONFLICT]: 409,
  [ERROR_CODES.RATE_LIMITED]: 429,
};

/**
 * ApiError 생성 헬퍼
 */
export function createApiError(
  code: string,
  message: string,
  statusCode?: number,
  details?: Record<string, any>
): ApiError {
  const status = statusCode || statusCodeMap[code] || 500;
  return new ApiError(code, message, status, details);
}

/**
 * API 성공 응답 생성
 */
export function successResponse<T>(data: T, statusCode: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * API 에러 응답 생성
 */
export function errorResponse(error: unknown): NextResponse<ApiResponse> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    const apiError = createApiError(ERROR_CODES.INTERNAL_SERVER_ERROR, error.message);
    return errorResponse(apiError);
  }

  const apiError = createApiError(ERROR_CODES.INTERNAL_SERVER_ERROR, String(error));
  return errorResponse(apiError);
}

/**
 * 에러 로깅 (필요시 외부 서비스로 전송)
 */
export function logError(error: any, context?: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    code: error instanceof ApiError ? error.code : undefined,
    context,
  };

  console.error('[API Error]', errorLog);

  // TODO: 외부 에러 로깅 서비스에 전송 (Sentry, LogRocket 등)
  // if (process.env.NODE_ENV === 'production') {
  //   captureException(error, { extra: context });
  // }
}

/**
 * 요청 검증 에러 (Zod 통합)
 */
export function validationError(
  fieldErrors: Record<string, string[]>
): ApiError {
  const details = Object.entries(fieldErrors).reduce(
    (acc, [field, errors]) => {
      acc[field] = errors[0];
      return acc;
    },
    {} as Record<string, any>
  );

  return createApiError(
    ERROR_CODES.INVALID_INPUT,
    '입력 값 검증에 실패했습니다.',
    400,
    details
  );
}

/**
 * 파일 검증
 */
export function validateFile(file: File, options?: { maxSize?: number; allowedTypes?: string[] }) {
  // 파일 크기 검증 (기본값: 100MB)
  const maxSize = options?.maxSize || 100 * 1024 * 1024;
  if (file.size > maxSize) {
    throw createApiError(
      ERROR_CODES.FILE_TOO_LARGE,
      `파일 크기가 너무 큽니다. 최대 ${maxSize / 1024 / 1024}MB까지 허용됩니다.`,
      413
    );
  }

  // 파일 타입 검증
  const allowedTypes = options?.allowedTypes || [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw createApiError(
      ERROR_CODES.INVALID_FILE_TYPE,
      `지원하지 않는 파일 형식입니다. PPT 파일을 업로드해주세요.`,
      400,
      { receivedType: file.type, allowedTypes }
    );
  }

  return true;
}
