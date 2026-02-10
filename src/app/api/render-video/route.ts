/**
 * POST /api/render-video
 * 비디오 렌더링 엔드포인트
 * 슬라이드, 음성, 효과를 조합하여 최종 비디오 생성
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse, logError, createApiError, ERROR_CODES, validationError } from '@/utils/errors';
import { VideoRenderResponse } from '@/types/api';
import axios from 'axios';

const VideoRenderRequestSchema = z.object({
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
  audioUrls: z.array(
    z.object({
      slideId: z.string(),
      slideNumber: z.number(),
      audioUrl: z.string(),
      duration: z.number(),
    })
  ),
  resolution: z.enum(['720p', '1080p', '4k']).default('1080p'),
  fps: z.number().min(24).max(60).default(30),
  outputFormat: z.enum(['mp4', 'webm']).default('mp4'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력 검증
    const validation = VideoRenderRequestSchema.safeParse(body);
    if (!validation.success) {
      throw validationError(validation.error.flatten().fieldErrors as any);
    }

    const { projectId, slides, audioUrls, resolution, fps, outputFormat } = validation.data;

    // 슬라이드와 오디오 개수 일치 확인
    if (slides.length !== audioUrls.length) {
      throw createApiError(
        ERROR_CODES.INVALID_INPUT,
        '슬라이드 개수와 오디오 개수가 일치하지 않습니다.',
        400,
        { slidesCount: slides.length, audioCount: audioUrls.length }
      );
    }

    console.log(`[VIDEO_RENDER] 비디오 렌더링 시작: ${projectId} (${resolution}, ${fps}fps)`);

    // FastAPI 백엔드로 요청 전달
    const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

    const response = await axios.post(`${backendUrl}/api/render-video`, {
      projectId,
      slides,
      audioUrls,
      resolution,
      fps,
      outputFormat,
    });

    if (!response.data.success) {
      throw createApiError(
        ERROR_CODES.VIDEO_RENDER_FAILED,
        response.data.error?.message || '비디오 렌더링 실패',
        500
      );
    }

    const renderResponse: VideoRenderResponse = response.data.data;
    return successResponse(renderResponse, 200);
  } catch (error) {
    logError(error, { endpoint: '/api/render-video' });
    return errorResponse(error);
  }
}
