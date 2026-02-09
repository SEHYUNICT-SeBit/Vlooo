/**
 * POST /api/generate-script
 * AI 스크립트 생성 엔드포인트
 * OpenAI GPT-4o-mini을 사용하여 IT 전문가 음성의 나레이션 생성
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse, logError, createApiError, ERROR_CODES, validationError } from '@/utils/errors';
import { ScriptGenerationResponse } from '@/types/api';

const ScriptGenerationRequestSchema = z.object({
  projectId: z.string().min(1),
  slides: z.array(
    z.object({
      slideId: z.string(),
      slideNumber: z.number(),
      title: z.string().optional(),
      content: z.string(),
      imageUrls: z.array(z.string()).default([]),
    })
  ),
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

    // TODO: 실제 구현
    // 1. OpenAI API 호출 (GPT-4o-mini)
    // 2. IT 전문가 페르소나 프롬프트 적용
    // 3. 각 슬라이드별 나레이션 스크립트 생성
    // 4. 한국어 자연스러움 검증

    const mockResponse: ScriptGenerationResponse = {
      projectId,
      scripts: slides.map((slide) => ({
        slideId: slide.slideId,
        slideNumber: slide.slideNumber,
        scriptText: `${slide.title || `슬라이드 ${slide.slideNumber}`}에 대한 나레이션 텍스트입니다.`,
        duration: 5,
        keywords: [],
      })),
      totalDuration: slides.length * 5,
      generatedAt: new Date().toISOString(),
    };

    return successResponse(mockResponse, 200);
  } catch (error) {
    logError(error, { endpoint: '/api/generate-script' });
    return errorResponse(error);
  }
}
