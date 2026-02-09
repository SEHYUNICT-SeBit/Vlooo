/**
 * POST /api/upload
 * PPT 파일 업로드 엔드포인트
 * 파일을 Cloudflare R2에 저장하고 fileId 반환
 */

import { NextRequest } from 'next/server';
import { validateFile, successResponse, errorResponse, logError, ERROR_CODES, createApiError } from '@/utils/errors';
import { UploadResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw createApiError(
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        '파일이 필요합니다.',
        400,
        { field: 'file' }
      );
    }

    // 파일 검증
    validateFile(file);

    // 파일 크기 확인
    console.log(`[UPLOAD] 파일 업로드 시작: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // TODO: 실제 구현
    // 1. Cloudflare R2에 업로드
    // 2. 파일 메타데이터 DB에 저장
    // 3. fileId 생성 및 반환

    const mockFileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response: UploadResponse = {
      fileId: mockFileId,
      filename: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    };

    return successResponse(response, 201);
  } catch (error) {
    logError(error, { endpoint: '/api/upload' });
    return errorResponse(error);
  }
}
