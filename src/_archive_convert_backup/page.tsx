'use client';

import { useEffect, useRef, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { FileUploader } from '@/components/FileUploader';
import { useConversionStore } from '@/context/ConversionStore';
import { useFileContext } from '@/context/FileContext';
import { apiClient } from '@/services/api';

const logStep = (level: 'MINOR' | 'MAJOR' | 'CRITICAL', step: string, message: string) => {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [CONVERT] [${level}] [${step}] ${message}`;
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

export default function ConvertPage() {
  const {
    currentStep,
    projectId,
    slides,
    scripts,
    audioUrls,
    loading,
    stageResults,
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
    resetConversion,
  } = useConversionStore();
  
  const { pendingFile, setPendingFile } = useFileContext();

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [retryCount, setRetryCount] = useState(0);
  const lastAttemptRef = useRef({
    parsing: -1,
    scripting: -1,
    tts: -1,
    rendering: -1,
  });
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hydratingRef = useRef(false);
  const hydratedProjectRef = useRef<string | null>(null);

  // pendingFile이 있으면 uploadFile로 설정하고 초기화
  useEffect(() => {
    if (pendingFile && !uploadFile) {
      console.log('[CONVERT] Setting uploadFile from pendingFile:', pendingFile.name);
      setUploadFile(pendingFile);
      setPendingFile(null); // 사용 후 즉시 초기화
    }
  }, [pendingFile, uploadFile, setPendingFile]);

  // 프로젝트 상태 폴링 (변환 중일 때만)
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
        // 폴링 에러는 무시
        logStep('MINOR', 'POLLING_ERROR', err instanceof Error ? err.message : '상태 조회 실패');
      }
    };

    // 즉시 한 번 실행
    pollProjectStatus();

    // 3초마다 폴링
    pollingIntervalRef.current = setInterval(pollProjectStatus, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [projectId, currentStep, setDetailedProgress]);

  // 백엔드 체크포인트에서 누락된 데이터 복구 (재시작/새로고침 대응)
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
          setStageResult('parsing', {
            status: results.parsing.status || 'completed',
            data: results.parsing.data,
            completedAt: results.parsing.completedAt,
          });
        }

        if (needsScripts && results.scripting?.data?.scripts) {
          setScripts(results.scripting.data.scripts);
          setStageResult('scripting', {
            status: results.scripting.status || 'completed',
            data: results.scripting.data,
            completedAt: results.scripting.completedAt,
          });
        }

        if (needsAudio && results['voice-synthesis']?.data?.audioUrls) {
          setAudioUrls(results['voice-synthesis'].data.audioUrls);
          setStageResult('voice-synthesis', {
            status: results['voice-synthesis'].status || 'completed',
            data: results['voice-synthesis'].data,
            completedAt: results['voice-synthesis'].completedAt,
          });
        }

        if (results.rendering?.data?.videoUrl) {
          setVideoUrl(results.rendering.data.videoUrl);
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

  // 업로드 완료 후 파싱 시작
  useEffect(() => {
    console.log('[CONVERT] Parsing effect - uploadFile:', uploadFile?.name, 'currentStep:', currentStep);
    if (!uploadFile || currentStep !== 'upload') return;
    if (lastAttemptRef.current.parsing === retryCount) return;
    lastAttemptRef.current.parsing = retryCount;

    const startParsing = async () => {
      try {
        console.log('[CONVERT] Starting parsing...');
        setLoading(true);
        setCurrentStep('parsing');
        logStep('MINOR', 'PARSING', `file=${uploadFile.name}`);

        const parseResponse = await apiClient.parsePpt(uploadFile, (progress) => {
          const mapped = 15 + Math.round(progress.percentage * 0.2);
          setProgress(Math.min(mapped, 35));
        });
        setProjectId(parseResponse.projectId);
        setSlides(parseResponse.slides);
        
        // 파싱 결과 저장 (재개용)
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

        // 다음 단계로 자동 진행
        setCurrentStep('scripting');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '파싱 실패';
        setError(errorMessage);
        setCurrentStep('upload');
        
        // 실패 결과 저장
        setStageResult('parsing', {
          status: 'failed',
          error: errorMessage,
        });
        
        logStep('CRITICAL', 'PARSING_ERROR', errorMessage);
        // 실패 시에는 재시도 버튼을 눌러야만 다시 실행
      } finally {
        setLoading(false);
      }
    };

    startParsing();
  }, [
    uploadFile,
    currentStep,
    retryCount,
    setCurrentStep,
    setError,
    setLoading,
    setProjectId,
    setSlides,
    setProgress,
    setStageResult,
  ]);

  // 슬라이드 준비 후 스크립트 생성 시작
  useEffect(() => {
    if (!projectId || !slides || currentStep !== 'scripting' || loading) return;
    if (lastAttemptRef.current.scripting === retryCount) return;
    lastAttemptRef.current.scripting = retryCount;

    // 이미 완료된 단계인지 체크 (재개 로직)
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
        
        // 스크립트 생성 결과 저장 (재개용)
        setStageResult('scripting', {
          status: 'completed',
          data: scriptResponse,
          completedAt: new Date().toISOString(),
        });
        
        setCurrentStep('voice-synthesis');
        logStep('MAJOR', 'SCRIPTING_DONE', `scripts=${scriptResponse.scripts.length}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '스크립트 생성 실패';
        setError(errorMessage);
        
        // 실패 결과 저장
        setStageResult('scripting', {
          status: 'failed',
          error: errorMessage,
        });
        
        logStep('CRITICAL', 'SCRIPTING_ERROR', errorMessage);
        // 실패 시에는 재시도 버튼을 눌러야만 다시 실행
      } finally {
        setLoading(false);
      }
    };

    generateScripts();
  }, [
    projectId,
    slides,
    currentStep,
    loading,
    retryCount,
    stageResults,
    setCurrentStep,
    setError,
    setLoading,
    setScripts,
    setStageResult,
  ]);

  // 스크립트 준비 후 TTS 생성
  useEffect(() => {
    if (!projectId || !scripts || currentStep !== 'voice-synthesis' || loading) return;
    if (lastAttemptRef.current.tts === retryCount) return;
    lastAttemptRef.current.tts = retryCount;

    // 이미 완료된 단계인지 체크 (재개 로직)
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

        const ttsResponse = await apiClient.generateTts(projectId, scripts, {
          voiceName: 'Professional Male (한국어)',
          speed: 1.0,
        });

        setAudioUrls(ttsResponse.audioUrls);
        
        // TTS 결과 저장 (재개용)
        setStageResult('voice-synthesis', {
          status: 'completed',
          data: ttsResponse,
          completedAt: new Date().toISOString(),
        });
        
        setCurrentStep('rendering');
        logStep('MAJOR', 'TTS_DONE', `audio=${ttsResponse.audioUrls.length}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'TTS 생성 실패';
        setError(errorMessage);
        
        // 실패 결과 저장
        setStageResult('voice-synthesis', {
          status: 'failed',
          error: errorMessage,
        });
        
        logStep('CRITICAL', 'TTS_ERROR', errorMessage);
        // 실패 시에는 재시도 버튼을 눌러야만 다시 실행
      } finally {
        setLoading(false);
      }
    };

    generateTts();
  }, [
    projectId,
    scripts,
    currentStep,
    loading,
    retryCount,
    stageResults,
    setAudioUrls,
    setCurrentStep,
    setError,
    setLoading,
    setStageResult,
  ]);

  // 음성 준비 후 비디오 렌더링
  useEffect(() => {
    if (!projectId || !slides || !audioUrls || currentStep !== 'rendering' || loading) return;
    if (lastAttemptRef.current.rendering === retryCount) return;
    lastAttemptRef.current.rendering = retryCount;

    // 이미 완료된 단계인지 체크 (재개 로직)
    const cachedResult = stageResults?.rendering;
    if (cachedResult?.status === 'completed' && cachedResult.data) {
      logStep('MINOR', 'RENDER_CACHED', `Using cached video from ${cachedResult.completedAt}`);
      setVideoUrl(cachedResult.data.videoUrl);
      setCurrentStep('completed');
      return;
    }

    const renderVideo = async () => {
      try {
        setLoading(true);
        logStep('MINOR', 'RENDER', `projectId=${projectId} slides=${slides.length}`);

        const videoResponse = await apiClient.renderVideo(
          projectId,
          slides,
          audioUrls,
          { resolution: '1080p', fps: 30, outputFormat: 'mp4' }
        );

        setVideoUrl(videoResponse.videoUrl);
        
        // 렌더링 결과 저장 (재개용)
        setStageResult('rendering', {
          status: 'completed',
          data: videoResponse,
          completedAt: new Date().toISOString(),
        });
        
        setCurrentStep('completed');
        logStep('MAJOR', 'RENDER_DONE', `videoUrl=${videoResponse.videoUrl}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '비디오 렌더링 실패';
        setError(errorMessage);
        
        // 실패 결과 저장
        setStageResult('rendering', {
          status: 'failed',
          error: errorMessage,
        });
        
        logStep('CRITICAL', 'RENDER_ERROR', errorMessage);
        // 실패 시에는 재시도 버튼을 눌러야만 다시 실행
      } finally {
        setLoading(false);
      }
    };

    renderVideo();
  }, [
    projectId,
    slides,
    audioUrls,
    currentStep,
    loading,
    retryCount,
    stageResults,
    setCurrentStep,
    setError,
    setLoading,
    setVideoUrl,
    setStageResult,
  ]);

  const handleUploadComplete = (file: File) => {
    setUploadFile(file);
    setRetryCount(0);
    setError(undefined);
    lastAttemptRef.current = {
      parsing: -1,
      scripting: -1,
      tts: -1,
      rendering: -1,
    };
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setError(undefined);
    if (currentStep === 'upload') {
      resetConversion();
      setUploadFile(null);
    }
  };

  const handleStartOver = () => {
    resetConversion();
    setUploadFile(null);
    setRetryCount(0);
    setError(undefined);
    lastAttemptRef.current = {
      parsing: -1,
      scripting: -1,
      tts: -1,
      rendering: -1,
    };
  };

  return (
    <>
      <Navigation isLoggedIn={true} />
      <main className="min-h-screen bg-[color:var(--surface)] py-12 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-start">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
                Convert
              </p>
              <h1 className="text-4xl font-semibold text-gray-900 mt-3">PPT를 영상으로 변환</h1>
              <p className="text-sm text-[color:var(--muted)] mt-3">
                업로드 한 번으로 스크립트, 음성, 렌더링까지 자동으로 연결됩니다.
              </p>
            </div>

            <div className="rounded-3xl border border-[color:var(--line)] bg-white p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">현재 단계</h2>
              <div className="space-y-2 text-sm text-[color:var(--muted)]">
                <p>1. 파일 업로드</p>
                <p>2. 스크립트 생성</p>
                <p>3. 음성 합성</p>
                <p>4. 영상 렌더링</p>
              </div>
              <div className="rounded-2xl bg-[color:var(--surface)] p-4 text-xs text-[color:var(--muted)]">
                변환 중에는 오른쪽 하단 팝업에서 진행 상황을 확인할 수 있습니다.
              </div>
            </div>

            {currentStep === 'upload' && (
              <div className="rounded-2xl border border-[color:var(--line)] bg-white p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">업로드 가이드</h3>
                <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                  <li>최대 100MB까지 업로드 가능합니다.</li>
                  <li>.ppt, .pptx 형식을 지원합니다.</li>
                  <li>기본 설정은 1080p MP4로 렌더링됩니다.</li>
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[color:var(--line)] bg-white p-8 shadow-sm">
            {currentStep === 'upload' ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">파일 업로드</h2>
                <FileUploader onUploadComplete={handleUploadComplete} onError={(err) => setError(err)} />
              </>
            ) : (
              <div className="text-center py-12 space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
                  Processing
                </p>
                <h2 className="text-2xl font-semibold text-gray-900">변환 진행 중</h2>
                <p className="text-sm text-[color:var(--muted)]">
                  변환은 백그라운드에서 계속 진행됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
