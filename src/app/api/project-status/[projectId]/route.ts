/**
 * GET /api/project-status/[projectId]
 * 프로젝트 상태 조회 엔드포인트
 * 변환 진행 상황, 에러, 최종 결과물 조회
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, logError, createApiError, ERROR_CODES } from '@/utils/errors';
import { ProjectStatus } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;

    if (!projectId) {
      throw createApiError(
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        '프로젝트 ID가 필요합니다.',
        400,
        { field: 'projectId' }
      );
    }

    console.log(`[PROJECT_STATUS] 상태 조회: ${projectId}`);

    // TODO: 실제 구현
    // 1. DB에서 프로젝트 상태 조회
    // 2. Redis에서 캐시된 진행률 확인
    // 3. 최신 상태 반환

    const mockResponse: ProjectStatus = {
      projectId,
      currentStep: 'scripting',
      progress: 45,
      metadata: {
        uploadedAt: new Date(Date.now() - 60 * 1000).toISOString(), // 1분 전
        filename: 'presentation.pptx',
        totalSlides: 10,
      },
      results: {
        scriptUrl: `https://storage.example.com/${projectId}/scripts.json`,
      },
    };

    return successResponse(mockResponse);
  } catch (error) {
    logError(error, { endpoint: '/api/project-status' });
    return errorResponse(error);
  }
}
