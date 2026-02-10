/**
 * API 클라이언트 서비스
 * 프론트엔드에서 백엔드 API와 통신하기 위한 통합 인터페이스
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  UploadResponse,
  ParsePptResponse,
  ScriptGenerationResponse,
  TtsResponse,
  VideoRenderResponse,
  ProjectStatus,
  ApiResponse,
  UploadProgress,
} from '@/types/api';
import { ApiError } from '@/utils/errors';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '') {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 응답 인터셉터
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        const apiError = error.response?.data?.error;
        if (apiError) {
          throw new ApiError(
            apiError.code,
            apiError.message,
            error.response?.status || 500,
            apiError.details
          );
        }
        throw error;
      }
    );
  }

  /**
   * PPT 파일 업로드
   */
  async uploadFile(
    file: File,
    projectName?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (projectName) formData.append('projectName', projectName);

    const response = await this.axiosInstance.post<ApiResponse<UploadResponse>>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100),
          });
        }
      },
    });

    return response.data.data!;
  }

  /**
   * PPT 파일 파싱
   */
  async parsePpt(fileId: string): Promise<ParsePptResponse> {
    const response = await this.axiosInstance.post<ApiResponse<ParsePptResponse>>('/api/parse-ppt', {
      fileId,
    });
    return response.data.data!;
  }

  /**
   * AI 스크립트 생성
   */
  async generateScript(
    projectId: string,
    slides: any[],
    options?: {
      toneOfVoice?: 'professional' | 'friendly' | 'casual';
      language?: 'ko' | 'en';
      customInstructions?: string;
    }
  ): Promise<ScriptGenerationResponse> {
    const response = await this.axiosInstance.post<ApiResponse<ScriptGenerationResponse>>(
      '/api/generate-script',
      {
        projectId,
        slides,
        ...options,
      }
    );
    return response.data.data!;
  }

  /**
   * TTS 음성 생성
   */
  async generateTts(
    projectId: string,
    scripts: any[],
    options?: {
      voiceId?: string;
      voiceName?: string;
      speed?: number;
    }
  ): Promise<TtsResponse> {
    const response = await this.axiosInstance.post<ApiResponse<TtsResponse>>('/api/generate-tts', {
      projectId,
      scripts,
      ...options,
    });
    return response.data.data!;
  }

  /**
   * 사용 가능한 음성 목록 조회
   */
  async getAvailableVoices() {
    const response = await this.axiosInstance.get('/api/generate-tts');
    return response.data.data;
  }

  /**
   * 비디오 렌더링
   */
  async renderVideo(
    projectId: string,
    slides: any[],
    audioUrls: any[],
    options?: {
      resolution?: '720p' | '1080p' | '4k';
      fps?: number;
      outputFormat?: 'mp4' | 'webm';
    }
  ): Promise<VideoRenderResponse> {
    const response = await this.axiosInstance.post<ApiResponse<VideoRenderResponse>>(
      '/api/render-video',
      {
        projectId,
        slides,
        audioUrls,
        ...options,
      }
    );
    return response.data.data!;
  }

  /**
   * 프로젝트 상태 조회
   */
  async getProjectStatus(projectId: string): Promise<ProjectStatus> {
    const response = await this.axiosInstance.get<ApiResponse<ProjectStatus>>(
      `/api/project-status/${projectId}`
    );
    return response.data.data!;
  }

  /**
   * 프로젝트 상태 폴링 (진행 상황 모니터링)
   */
  async pollProjectStatus(
    projectId: string,
    maxAttempts: number = 60,
    interval: number = 5000
  ): Promise<ProjectStatus> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        attempts++;

        try {
          const status = await this.getProjectStatus(projectId);

          // 완료 또는 에러 상태이면 폴링 중단
          if (status.currentStep === 'completed' || status.error) {
            clearInterval(timer);
            resolve(status);
            return;
          }

          // 최대 시도 횟수 초과
          if (attempts >= maxAttempts) {
            clearInterval(timer);
            reject(new Error('프로젝트 처리 시간 초과'));
            return;
          }
        } catch (error) {
          clearInterval(timer);
          reject(error);
        }
      }, interval);
    });
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient();

export default ApiClient;
