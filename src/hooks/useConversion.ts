/**
 * useConversion Hook
 * 
 * PPT → 영상 변환 전체 프로세스 관리
 * - 파일 업로드 → PPT 파싱 → 스크립트 생성 → TTS → 렌더링
 */

import { useEffect, useRef } from 'react';
import { useConversionStore } from '@/context/ConversionStore';
import { apiClient } from '@/services/api';

const logStep = (level: 'MINOR' | 'MAJOR' | 'CRITICAL', step: string, message: string) => {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [CONVERSION] [${level}] [${step}] ${message}`;
  if (level === 'CRITICAL') {
    console.error(line);
    return;
  }
  if (level === 'MAJOR') {
    console.warn(line);
    return;
  }
  console.log(line);
};

export const useConversion = (uploadFile: File | null) => {
  const {
    currentStep,
    projectId,
    slides,
    scripts,
    audioUrls,
    stageResults,
    selectedVoiceId,
    setCurrentStep,
    setProjectId,
    setSlides,
    setScripts,
    setAudioUrls,
    setVideoUrl,
    setProgress,
    setError,
    setLoading,
    setDetailedProgress,
    setStageResult,
  } = useConversionStore();

  const lastAttemptRef = useRef({
    parsing: -1,
    scripting: -1,
    tts: -1,
    rendering: -1,
  });
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hydratingRef = useRef(false);
  const hydratedProjectRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);

  // 프로젝트 상태 폴링
  useEffect(() => {
    if (!projectId || currentStep === 'upload' || currentStep === 'completed') {
      setDetailedProgress(undefined);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const pollProjectStatus = async () => {
      try {
        const rawApiBase =
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.NEXT_PUBLIC_FASTAPI_URL ||
          'http://localhost:8001';
        const apiBase = rawApiBase.startsWith('http://') || rawApiBase.startsWith('https://')
          ? rawApiBase
          : `http://${rawApiBase}`;

        const response = await fetch(`${apiBase}/api/project-status/${projectId}`);
        const data = await response.json();

        if (data.current > 0 && data.total > 0) {
          setDetailedProgress({
            current: data.current,
            total: data.total,
            stage: data.stage,
            details: data.details,
          });
        } else {
          setDetailedProgress(undefined);
        }
      } catch (err) {
        setDetailedProgress(undefined);
        logStep('MINOR', 'POLLING_ERROR', err instanceof Error ? err.message : '상태 조회 실패');
      }
    };

    pollProjectStatus();
    pollingIntervalRef.current = setInterval(pollProjectStatus, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [projectId, currentStep, setDetailedProgress]);

  // 백엔드 체크포인트에서 데이터 복구
  useEffect(() => {
    if (!projectId || hydratingRef.current) return;

    const needsSlides = !slides;
    const needsScripts = !scripts;
    const needsAudio = !audioUrls;

    if (!needsSlides && !needsScripts && !needsAudio) return;
    if (hydratedProjectRef.current === projectId && currentStep !== 'rendering') return;

    const hydrateFromBackend = async () => {
      try {
        hydratingRef.current = true;

        const rawApiBase =
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.NEXT_PUBLIC_FASTAPI_URL ||
          'http://localhost:8001';
        const apiBase = rawApiBase.startsWith('http://') || rawApiBase.startsWith('https://')
          ? rawApiBase
          : `http://${rawApiBase}`;

        const response = await fetch(`${apiBase}/api/project-status/${projectId}`);
        const data = await response.json();
        const results = data?.results || {};

        if (needsSlides && results.parsing?.data?.slides) {
          setSlides(results.parsing.data.slides);
          // @ts-ignore - Type narrowing issue
          setStageResult('parsing', {
            status: results.parsing.status || 'completed',
            data: results.parsing.data,
            completedAt: results.parsing.completedAt,
          });
        }

        if (needsScripts && results.scripting?.data?.scripts) {
          setScripts(results.scripting.data.scripts);
          // @ts-ignore - Type narrowing issue
          setStageResult('scripting', {
            status: results.scripting.status || 'completed',
            data: results.scripting.data,
            completedAt: results.scripting.completedAt,
          });
        }

        if (needsAudio && results['voice-synthesis']?.data?.audioUrls) {
          setAudioUrls(results['voice-synthesis'].data.audioUrls);
          // @ts-ignore - Type narrowing issue
          setStageResult('voice-synthesis', {
            status: results['voice-synthesis'].status || 'completed',
            data: results['voice-synthesis'].data,
            completedAt: results['voice-synthesis'].completedAt,
          });
        }

        if (results.rendering?.data?.videoUrl) {
          setVideoUrl(results.rendering.data.videoUrl);
          // @ts-ignore - Type narrowing issue
          setStageResult('rendering', {
            status: results.rendering.status || 'completed',
            data: results.rendering.data,
            completedAt: results.rendering.completedAt,
          });
          setCurrentStep('completed');
        }

        hydratedProjectRef.current = projectId;
      } catch (err) {
        logStep('MINOR', 'HYDRATE_ERROR', err instanceof Error ? err.message : '상태 복구 실패');
      } finally {
        hydratingRef.current = false;
      }
    };

    hydrateFromBackend();
  }, [
    projectId,
    currentStep,
    slides,
    scripts,
    audioUrls,
    setSlides,
    setScripts,
    setAudioUrls,
    setVideoUrl,
    setCurrentStep,
    setStageResult,
  ]);

  // 1단계: PPT 파싱
  useEffect(() => {
    console.log('[CONVERSION] Parsing effect - uploadFile:', uploadFile?.name, 'currentStep:', currentStep);
    if (!uploadFile || currentStep !== 'upload') return;
    if (lastAttemptRef.current.parsing === retryCountRef.current) return;
    lastAttemptRef.current.parsing = retryCountRef.current;

    const startParsing = async () => {
      try {
        console.log('[CONVERSION] Starting parsing...');
        setLoading(true);
        setCurrentStep('parsing');
        logStep('MINOR', 'PARSING', `file=${uploadFile.name}`);

        const parseResponse = await apiClient.parsePpt(uploadFile, (progress) => {
          const mapped = 15 + Math.round(progress.percentage * 0.2);
          setProgress(Math.min(mapped, 35));
        });
        setProjectId(parseResponse.projectId);
        setSlides(parseResponse.slides);

        // @ts-ignore - Type narrowing issue
        setStageResult('parsing', {
          status: 'completed',
          data: parseResponse,
          completedAt: new Date().toISOString(),
        });

        logStep(
          'MAJOR',
          'PARSING_DONE',
          `projectId=${parseResponse.projectId} slides=${parseResponse.slides.length}`
        );

        setCurrentStep('scripting');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '파싱 실패';
        setError(errorMessage);
        setCurrentStep('upload');

        // @ts-ignore - Type narrowing issue
        setStageResult('parsing', {
          status: 'failed',
          error: errorMessage,
        });

        logStep('CRITICAL', 'PARSING_ERROR', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    startParsing();
  }, [uploadFile, currentStep, setCurrentStep, setError, setLoading, setProjectId, setSlides, setProgress, setStageResult]);

  // 2단계: 스크립트 생성
  useEffect(() => {
    if (!projectId || !slides || currentStep !== 'scripting') return;
    if (lastAttemptRef.current.scripting === retryCountRef.current) return;
    lastAttemptRef.current.scripting = retryCountRef.current;

    const cachedResult = stageResults?.scripting;
    if (cachedResult?.status === 'completed' && cachedResult.data) {
      logStep('MINOR', 'SCRIPTING_CACHED', `Using cached scripts from ${cachedResult.completedAt}`);
      setScripts(cachedResult.data.scripts);
      setCurrentStep('voice-synthesis');
      return;
    }

    const generateScripts = async () => {
      try {
        setLoading(true);
        logStep('MINOR', 'SCRIPTING', `projectId=${projectId} slides=${slides.length}`);

        const scriptResponse = await apiClient.generateScript(projectId, slides, {
          toneOfVoice: 'professional',
          language: 'ko',
        });

        setScripts(scriptResponse.scripts);

        // @ts-ignore - Type narrowing issue
        setStageResult('scripting', {
          status: 'completed',
          data: scriptResponse,
          completedAt: new Date().toISOString(),
        });

        logStep('MAJOR', 'SCRIPTING_DONE', `scripts=${scriptResponse.scripts.length}`);
        setCurrentStep('voice-synthesis');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '스크립트 생성 실패';
        setError(errorMessage);

        // @ts-ignore - Type narrowing issue
        setStageResult('scripting', {
          status: 'failed',
          error: errorMessage,
        });

        logStep('CRITICAL', 'SCRIPTING_ERROR', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    generateScripts();
  }, [projectId, slides, currentStep, stageResults, setCurrentStep, setScripts, setError, setLoading, setStageResult]);

  // 3단계: TTS 음성 합성
  useEffect(() => {
    if (!projectId || !scripts || currentStep !== 'voice-synthesis') return;
    if (lastAttemptRef.current.tts === retryCountRef.current) return;
    lastAttemptRef.current.tts = retryCountRef.current;

    const cachedResult = stageResults?.['voice-synthesis'];
    if (cachedResult?.status === 'completed' && cachedResult.data) {
      logStep('MINOR', 'TTS_CACHED', `Using cached audio from ${cachedResult.completedAt}`);
      setAudioUrls(cachedResult.data.audioUrls);
      setCurrentStep('rendering');
      return;
    }

    const generateTts = async () => {
      try {
        setLoading(true);
        logStep('MINOR', 'TTS', `projectId=${projectId} scripts=${scripts.length}`);

        const ttsResponse = await apiClient.generateTts(
          projectId,
          scripts,
          { voiceId: selectedVoiceId || 'ko-KR-Standard-A' }
        );

        setAudioUrls(ttsResponse.audioUrls);

        // @ts-ignore - Type narrowing issue
        setStageResult('voice-synthesis', {
          status: 'completed',
          data: ttsResponse,
          completedAt: new Date().toISOString(),
        });

        logStep('MAJOR', 'TTS_DONE', `audioUrls=${ttsResponse.audioUrls.length}`);
        setCurrentStep('rendering');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'TTS 생성 실패';
        setError(errorMessage);

        // @ts-ignore - Type narrowing issue
        setStageResult('voice-synthesis', {
          status: 'failed',
          error: errorMessage,
        });

        logStep('CRITICAL', 'TTS_ERROR', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    generateTts();
  }, [projectId, scripts, currentStep, selectedVoiceId, stageResults, setCurrentStep, setAudioUrls, setError, setLoading, setStageResult]);

  // 4단계: 비디오 렌더링
  useEffect(() => {
    if (!projectId || !slides || !audioUrls || currentStep !== 'rendering') return;
    if (lastAttemptRef.current.rendering === retryCountRef.current) return;
    lastAttemptRef.current.rendering = retryCountRef.current;

    const cachedResult = stageResults?.rendering;
    if (cachedResult?.status === 'completed' && cachedResult.data) {
      logStep('MINOR', 'RENDERING_CACHED', `Using cached video from ${cachedResult.completedAt}`);
      setVideoUrl(cachedResult.data.videoUrl);
      setCurrentStep('completed');
      return;
    }

    const renderVideo = async () => {
      try {
        setLoading(true);
        logStep('MINOR', 'RENDERING', `projectId=${projectId}`);

        const renderResponse = await apiClient.renderVideo(projectId, slides, audioUrls);

        setVideoUrl(renderResponse.videoUrl);

        // @ts-ignore - Type narrowing issue
        setStageResult('rendering', {
          status: 'completed',
          data: renderResponse,
          completedAt: new Date().toISOString(),
        });

        logStep('MAJOR', 'RENDERING_DONE', `videoUrl=${renderResponse.videoUrl}`);
        setCurrentStep('completed');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '렌더링 실패';
        setError(errorMessage);

        // @ts-ignore - Type narrowing issue
        setStageResult('rendering', {
          status: 'failed',
          error: errorMessage,
        });

        logStep('CRITICAL', 'RENDERING_ERROR', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    renderVideo();
  }, [projectId, slides, audioUrls, currentStep, stageResults, setCurrentStep, setVideoUrl, setError, setLoading, setStageResult]);
};
