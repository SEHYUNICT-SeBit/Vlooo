/**
 * POST /api/generate-script
 * AI 스크립트 생성 엔드포인트
 * FastAPI 백엔드로 요청 전달
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import axios from 'axios';
import {
  successResponse,
  errorResponse,
  logError,
  createApiError,
  ERROR_CODES,
  validationError,
} from '@/utils/errors';
import { ScriptGenerationResponse } from '@/types/api';

const ScriptGenerationRequestSchema = z.object({
  projectId: z.string().min(1, '프로젝트 ID가 필요합니다'),
  slides: z
    .array(
      z.object({
        slideId: z.string(),
        slideNumber: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        imageUrls: z.array(z.string()).optional(),
      })
    )
    .min(1, '슬라이드가 필요합니다'),
  toneOfVoice: z.enum(['professional', 'friendly', 'casual']).default('professional'),
  language: z.enum(['ko', 'en']).default('ko'),
  customInstructions: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력 검증
    const validation = ScriptGenerationRequestSchema.safeParse(body);
    if (!validation.success) {
      throw validationError(validation.error.flatten().fieldErrors as any);
    }

    const { projectId, slides, toneOfVoice, language, customInstructions } = validation.data;

    console.log(`[SCRIPT_GEN] 스크립트 생성 시작: ${projectId} (${slides.length}개 슬라이드)`);

    // FastAPI 백엔드로 요청 전달
    const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const response = await axios.post(`${backendUrl}/api/generate-script`, {
      projectId,
      slides,
      toneOfVoice,
      language,
      customInstructions,
    });

    if (!response.data.success) {
      throw createApiError(
        ERROR_CODES.SCRIPT_GENERATION_FAILED,
        response.data.error?.message || '스크립트 생성 실패',
        500
      );
    }

    const scriptResponse: ScriptGenerationResponse = response.data.data;

    return successResponse(scriptResponse, 200);
  } catch (error) {
    logError(error, { endpoint: '/api/generate-script' });
    return errorResponse(error);
  }
}
