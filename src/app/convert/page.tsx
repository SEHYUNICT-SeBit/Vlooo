'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { ConversionSteps } from '@/components/ConversionSteps';
import { Footer } from '@/components/Footer';
import { FileUploader } from '@/components/FileUploader';
import { ProgressDisplay } from '@/components/ProgressDisplay';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { useConversionStore, useCurrentStep } from '@/context/ConversionStore';
import { apiClient } from '@/services/api';

// 단계를 번호로 변환
function getStepNumber(step: string): number {
  const stepMap = {
    upload: 1,
    parsing: 2,
    scripting: 3,
    'voice-synthesis': 4,
    rendering: 5,
    completed: 6,
  };
  return (stepMap as Record<string, number>)[step] || 1;
}

export default function ConvertPage() {
  const {
    currentStep,
    projectId,
    uploadedFile,
    slides,
    scripts,
    audioUrls,
    videoUrl,
    error,
    loading,
    setCurrentStep,
    setProjectId,
    setSlides,
    setScripts,
    setAudioUrls,
    setVideoUrl,
    setError,
    setLoading,
    resetConversion,
  } = useConversionStore();

  const [retryCount, setRetryCount] = useState(0);
  const [fileId, setFileId] = useState<string | null>(null);

  const { stepName } = useCurrentStep();

  // 업로드 완료 후 파싱 시작
  useEffect(() => {
    if (!fileId || currentStep !== 'upload') return;

    const startParsing = async () => {
      try {
        setLoading(true);
        setCurrentStep('parsing');

        const parseResponse = await apiClient.parsePpt(fileId);
        setProjectId(parseResponse.projectId);
        setSlides(parseResponse.slides);

        // 다음 단계로 자동 진행
        setCurrentStep('scripting');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '파싱 실패';
        setError(errorMessage);
        setCurrentStep('upload');
      } finally {
        setLoading(false);
      }
    };

    startParsing();
  }, [fileId, currentStep, setCurrentStep, setError, setLoading, setProjectId, setSlides]);

  // 슬라이드 준비 후 스크립트 생성 시작
  useEffect(() => {
    if (!projectId || !slides || currentStep !== 'scripting' || loading) return;

    const generateScripts = async () => {
      try {
        setLoading(true);

        const scriptResponse = await apiClient.generateScript(projectId, slides, {
          toneOfVoice: 'professional',
          language: 'ko',
        });

        setScripts(scriptResponse.scripts);
        setCurrentStep('voice-synthesis');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '스크립트 생성 실패';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    generateScripts();
  }, [projectId, slides, currentStep, loading, setCurrentStep, setError, setLoading, setScripts]);

  // 스크립트 준비 후 TTS 생성
  useEffect(() => {
    if (!projectId || !scripts || currentStep !== 'voice-synthesis' || loading) return;

    const generateTts = async () => {
      try {
        setLoading(true);

        const ttsResponse = await apiClient.generateTts(projectId, scripts, {
          voiceName: 'Professional Male (한국어)',
          speed: 1.0,
        });

        setAudioUrls(ttsResponse.audioUrls);
        setCurrentStep('rendering');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'TTS 생성 실패';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    generateTts();
  }, [projectId, scripts, currentStep, loading, setAudioUrls, setCurrentStep, setError, setLoading]);

  // 음성 준비 후 비디오 렌더링
  useEffect(() => {
    if (!projectId || !slides || !audioUrls || currentStep !== 'rendering' || loading) return;

    const renderVideo = async () => {
      try {
        setLoading(true);

        const videoResponse = await apiClient.renderVideo(
          projectId,
          slides,
          audioUrls,
          { resolution: '1080p', fps: 30, outputFormat: 'mp4' }
        );

        setVideoUrl(videoResponse.videoUrl);
        setCurrentStep('completed');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '비디오 렌더링 실패';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    renderVideo();
  }, [projectId, slides, audioUrls, currentStep, loading, setCurrentStep, setError, setLoading, setVideoUrl]);

  const handleUploadComplete = (newFileId: string) => {
    setFileId(newFileId);
    setRetryCount(0);
    setError(undefined);
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setError(undefined);
    if (currentStep === 'upload') {
      resetConversion();
      setFileId(null);
    }
  };

  return (
    <>
      <Navigation isLoggedIn={true} />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">PPT를 영상으로 변환</h1>
            <p className="text-gray-600">AI가 자동으로 전문가급 프레젠테이션 영상을 만들어드립니다</p>
          </div>

          {/* 진행 단계 표시 */}
          <ConversionSteps currentStep={getStepNumber(currentStep)} />

          {/* 메인 콘텐츠 */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            {/* 에러 표시 */}
            {error && (
              <ErrorDisplay
                error={error}
                retryCount={retryCount}
                severity="error"
                onRetry={handleRetry}
                onDismiss={() => setError(undefined)}
              />
            )}

            {/* 단계별 UI */}
            {currentStep === 'upload' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: PPT 파일 업로드</h2>
                <FileUploader
                  onUploadComplete={handleUploadComplete}
                  onError={(err) => setError(err)}
                />
              </div>
            )}

            {currentStep !== 'upload' && currentStep !== 'completed' && (
              <ProgressDisplay showDetails={true} />
            )}

            {currentStep === 'completed' && videoUrl && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">결과물</h2>
                <ResultsDisplay
                  videoUrl={videoUrl}
                  audioUrls={audioUrls}
                  scripts={scripts}
                  projectName={uploadedFile?.name.replace(/\.[^.]+$/, '') || 'My Project'}
                />
              </div>
            )}
          </div>

          {/* 정보 박스 */}
          {currentStep === 'upload' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-blue-900 mb-3">💡 Vlooo 사용 팁</h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>• 최대 100MB까지 업로드 가능합니다</li>
                <li>• .ppt, .pptx 형식을 지원합니다</li>
                <li>• 슬라이드당 평균 3-5분 정도 소요됩니다</li>
                <li>• 기본 설정으로 1080p 해상도의 MP4 파일이 생성됩니다</li>
              </ul>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
