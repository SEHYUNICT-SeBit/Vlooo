/**
 * POST /api/generate-tts
 * TTS (음성 합성) 엔드포인트
 * ElevenLabs API를 사용하여 스크립트를 음성으로 변환
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse, logError, createApiError, ERROR_CODES, validationError } from '@/utils/errors';
import { TtsResponse } from '@/types/api';
import axios from 'axios';

const TtsRequestSchema = z.object({
  projectId: z.string().min(1),
  scripts: z.array(
    z.object({
      slideId: z.string(),
      slideNumber: z.number(),
      scriptText: z.string(),
      duration: z.number().optional(),
    })
  ),
  voiceId: z.string().optional(),
  voiceName: z.string().optional(),
  speed: z.number().min(0.5).max(2).default(1),
});

// 사전정의된 ElevenLabs 음성 옵션
const AVAILABLE_VOICES = [
  {
    id: 'male_professional_kr',
    name: 'Professional Male (한국어)',
    gender: 'male',
    accent: 'korean',
    description: 'IT 프로페셔널 남성 음성',
  },
  {
    id: 'female_professional_kr',
    name: 'Professional Female (한국어)',
    gender: 'female',
    accent: 'korean',
    description: 'IT 프로페셔널 여성 음성',
  },
  {
    id: 'male_friendly_kr',
    name: 'Friendly Male (한국어)',
    gender: 'male',
    accent: 'korean',
    description: '친근한 남성 음성',
  },
  {
    id: 'female_friendly_kr',
    name: 'Friendly Female (한국어)',
    gender: 'female',
    accent: 'korean',
    description: '친근한 여성 음성',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력 검증
    const validation = TtsRequestSchema.safeParse(body);
    if (!validation.success) {
      throw validationError(validation.error.flatten().fieldErrors as any);
    }

    const { projectId, scripts, voiceId, voiceName, speed } = validation.data;

    console.log(`[TTS] 음성 합성 시작: ${projectId} (${scripts.length}개 음성)`);

    // 음성 ID 검증
    if (voiceId && !AVAILABLE_VOICES.find((v) => v.id === voiceId)) {
      throw createApiError(
        ERROR_CODES.VOICE_NOT_FOUND,
        '찾을 수 없는 음성입니다.',
        404,
        { voiceId }
      );
    }

    // FastAPI 백엔드로 요청 전달
    const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

    const response = await axios.post(`${backendUrl}/api/generate-tts`, {
      projectId,
      scripts,
      voiceId,
      voiceName,
      speed,
    });

    if (!response.data.success) {
      throw createApiError(
        ERROR_CODES.TTS_GENERATION_FAILED,
        response.data.error?.message || 'TTS 생성 실패',
        500
      );
    }

    const ttsResponse: TtsResponse = response.data.data;
    return successResponse(ttsResponse, 200);
  } catch (error) {
    logError(error, { endpoint: '/api/generate-tts' });
    return errorResponse(error);
  }
}

/**
 * GET /api/generate-tts/voices
 * 사용 가능한 음성 목록 조회
 */
export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const response = await axios.get(`${backendUrl}/api/tts/voices`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || '음성 목록 조회 실패');
    }

    return successResponse(response.data.data);
  } catch (error) {
    logError(error, { endpoint: '/api/generate-tts/voices' });
    // 백엔드 장애 시 로컬 목록으로 폴백
    return successResponse({
      voices: AVAILABLE_VOICES,
      total: AVAILABLE_VOICES.length,
    });
  }
}
