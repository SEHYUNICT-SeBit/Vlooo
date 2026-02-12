/**
 * Conversion Context/Store (Zustand)
 * 변환 프로세스 전체 상태를 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConversionContextState, ConversionStep } from '@/types/api';

// 단계별 완료 상태
type StageStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

interface StageResult {
  status: StageStatus;
  data?: any;
  error?: string;
  completedAt?: string;
}

interface ConversionStore extends ConversionContextState {
  // 단계별 완료 상태 (재개 로직용)
  stageResults?: {
    parsing?: StageResult;
    scripting?: StageResult;
    'voice-synthesis'?: StageResult;
    rendering?: StageResult;
  };
  
  // 액션
  setProjectId: (id: string) => void;
  setCurrentStep: (step: ConversionStep) => void;
  setUploadedFile: (file: { name: string; size: number }) => void;
  setSlides: (slides: any[]) => void;
  setScripts: (scripts: any[]) => void;
  setSelectedVoiceId: (voiceId: string) => void;
  setAudioUrls: (audioUrls: any[]) => void;
  setVideoUrl: (url: string) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | undefined) => void;
  setLoading: (loading: boolean) => void;
  setDetailedProgress: (detailedProgress: ConversionContextState['detailedProgress']) => void;
  setStageResult: (stage: keyof ConversionStore['stageResults'], result: StageResult) => void;
  resetConversion: () => void;
  cancelConversion: (projectId?: string) => Promise<void>;
}

export const useConversionStore = create<ConversionStore>()(
  persist(
    (set) => ({
      // 초기 상태
      currentStep: 'upload',
      progress: 0,
      loading: false,

      // 액션
      setProjectId: (id) => set({ projectId: id }),

  setCurrentStep: (step) => {
    // 진행률 자동 업데이트
    const stepProgress: Record<ConversionStep, number> = {
      upload: 0,
      parsing: 15,
      scripting: 35,
      'voice-synthesis': 60,
      rendering: 85,
      completed: 100,
    };

    set({
      currentStep: step,
      progress: stepProgress[step],
    });
  },

  setUploadedFile: (file) => set({ uploadedFile: file }),

  setSlides: (slides) => set({ slides }),

  setScripts: (scripts) => set({ scripts }),

  setSelectedVoiceId: (voiceId) => set({ selectedVoiceId: voiceId }),

  setAudioUrls: (audioUrls) => set({ audioUrls }),

  setVideoUrl: (url) => set({ videoUrl: url }),

  setProgress: (progress) => set({ progress }),

  setError: (error) => set({ error }),

  setLoading: (loading) => set({ loading }),

  setDetailedProgress: (detailedProgress) => set({ detailedProgress }),

  setStageResult: (stage, result) => set((state) => ({
    stageResults: {
      ...state.stageResults,
      [stage]: result,
    },
  })),

  resetConversion: () =>
    set({
      projectId: undefined,
      currentStep: 'upload',
      uploadedFile: undefined,
      slides: undefined,
      scripts: undefined,
      selectedVoiceId: undefined,
      audioUrls: undefined,
      videoUrl: undefined,
      progress: 0,
      error: undefined,
      loading: false,
      detailedProgress: undefined,
      stageResults: undefined,
    }),
  
  cancelConversion: async (projectId) => {
    if (projectId) {
      try {
        // 백엔드가 내려가도 UI는 즉시 초기화되도록 짧은 타임아웃 사용
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/project/${projectId}`,
          {
            method: 'DELETE',
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);
        if (!response.ok) {
          console.error('Failed to delete project checkpoint');
        }
      } catch (error) {
        console.error('Error canceling conversion:', error);
      }
    }
    // 상태 초기화
    set({
      projectId: undefined,
      currentStep: 'upload',
      uploadedFile: undefined,
      slides: undefined,
      scripts: undefined,
      selectedVoiceId: undefined,
      audioUrls: undefined,
      videoUrl: undefined,
      progress: 0,
      error: undefined,
      loading: false,
      detailedProgress: undefined,
      stageResults: undefined,
    });
  },
    }),
    {
      name: 'conversion-store',
      // audioUrls, videoUrl, scripts 같은 큰 데이터는 저장하지 않음 (localStorage 용량 초과 방지)
      partialize: (state) => ({
        projectId: state.projectId,
        currentStep: state.currentStep,
        progress: state.progress,
        selectedVoiceId: state.selectedVoiceId,
        error: state.error,
        loading: state.loading,
      }),
    }
  )
);

// 커스텀 훅: 현재 스텝 정보 조회
export const useCurrentStep = () => {
  const currentStep = useConversionStore((state) => state.currentStep);
  const stepNames: Record<ConversionStep, string> = {
    upload: '파일 업로드',
    parsing: 'PPT 분석',
    scripting: '스크립트 생성',
    'voice-synthesis': '음성 합성',
    rendering: '영상 렌더링',
    completed: '완료',
  };

  return {
    currentStep,
    stepName: stepNames[currentStep],
  };
};

// 커스텀 훅: 프로그레스 정보
export const useProgress = () => {
  return useConversionStore((state) => ({
    progress: state.progress,
    currentStep: state.currentStep,
    loading: state.loading,
  }));
};

// 커스텀 훅: 변환 결과
export const useConversionResults = () => {
  return useConversionStore((state) => ({
    videoUrl: state.videoUrl,
    audioUrls: state.audioUrls,
    scripts: state.scripts,
  }));
};
