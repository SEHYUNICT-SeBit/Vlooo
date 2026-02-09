/**
 * POST /api/parse-ppt
 * PPT 파일 파싱 엔드포인트
 * 슬라이드 추출, 텍스트 및 이미지 파싱
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse, logError, createApiError, ERROR_CODES, validationError } from '@/utils/errors';
import { ParsePptResponse } from '@/types/api';

const ParsePptRequestSchema = z.object({
  fileId: z.string().min(1, '파일 ID가 필요합니다'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력 검증
    const validation = ParsePptRequestSchema.safeParse(body);
    if (!validation.success) {
      throw validationError(validation.error.flatten().fieldErrors as any);
    }

    const { fileId } = validation.data;

    console.log(`[PARSE_PPT] 파싱 시작: ${fileId}`);

    // TODO: 실제 구현
    // 1. fileId로 파일 조회 (R2 또는 DB)
    // 2. python-pptx를 사용하여 PPT 파싱 (FastAPI 백엔드로 전달)
    // 3. 슬라이드 정보 추출
    // 4. 이미지 R2에 업로드

    const mockResponse: ParsePptResponse = {
      projectId: `proj_${Date.now()}`,
      totalSlides: 0,
      slides: [],
      extractedText: '',
      metadata: {
        pptTitle: 'Sample PPT',
        createdAt: new Date().toISOString(),
      },
    };

    return successResponse(mockResponse, 200);
  } catch (error) {
    logError(error, { endpoint: '/api/parse-ppt' });
    return errorResponse(error);
  }
}
