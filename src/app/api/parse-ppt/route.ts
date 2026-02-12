/**
 * POST /api/parse-ppt
 * PPT 파일 파싱 엔드포인트
 * 슬라이드 추출, 텍스트 및 이미지 파싱
 */

import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  logError,
  createApiError,
  ERROR_CODES,
  validateFile,
} from '@/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw createApiError(
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        '파일이 필요합니다.',
        400,
        { field: 'file' }
      );
    }

    validateFile(file);

    console.log(`[PARSE_PPT] 파싱 시작: ${file.name}`);

    const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8001';
    const response = await fetch(`${backendUrl}/api/parse-ppt`, {
      method: 'POST',
      body: formData,
    });

    const payload = await response.json();

    if (!payload.success) {
      throw createApiError(
        ERROR_CODES.PPT_PARSE_ERROR,
        payload.error?.message || 'PPT 파싱 실패',
        response.status,
        payload.error?.details
      );
    }

    return successResponse(payload.data, 200);
  } catch (error) {
    logError(error, { endpoint: '/api/parse-ppt' });
    return errorResponse(error);
  }
}
