'use client';

import React, { useEffect, useState } from 'react';
import { useConversionStore } from '@/context/ConversionStore';
import Link from 'next/link';

const stepNames: Record<string, string> = {
  upload: '파일 업로드',
  parsing: 'PPT 분석 중',
  scripting: '스크립트 생성 중',
  'voice-synthesis': '음성 합성 중',
  rendering: '영상 렌더링 중',
  completed: '변환 완료',
};

export const ConversionProgressModal: React.FC = () => {
  const { 
    currentStep, 
    progress, 
    loading, 
    error, 
    videoUrl, 
    projectId, 
    detailedProgress, 
    resetConversion,
    cancelConversion,
    stageResults,
    setCurrentStep,
    setError,
    setLoading,
  } = useConversionStore();

  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isManuallyHidden, setIsManuallyHidden] = useState(false);

  // 클라이언트에서만 실행
  useEffect(() => {
    setMounted(true);
  }, []);

  // 변환 진행 중인지 체크 (upload 상태는 제외)
  useEffect(() => {
    console.log('[PROGRESS_MODAL] currentStep:', currentStep, 'mounted:', mounted, 'videoUrl:', videoUrl);
    if (mounted && currentStep !== 'upload' && currentStep !== 'completed') {
      console.log('[PROGRESS_MODAL] Showing modal (in-progress)');
      setIsVisible(true);
      setIsManuallyHidden(false); // 새 변환 시작 시 자동으로 다시 표시
    } else if (mounted && currentStep === 'completed' && videoUrl) {
      console.log('[PROGRESS_MODAL] Showing modal (completed)');
      setIsVisible(true);
      setIsManuallyHidden(false); // 완료 시 자동으로 다시 표시
    }
  }, [currentStep, videoUrl, mounted]);

  const handleClose = async () => {
    const confirmed = window.confirm(
      '변환을 취소하시겠습니까?\n\n' +
      '진행 중인 변환 작업이 종료되며,\n' +
      '저장된 이력이 모두 삭제됩니다.'
    );
    
    if (confirmed) {
      await cancelConversion(projectId); // 백엔드 체크포인트 삭제 + 상태 초기화
      setIsManuallyHidden(true); // 팝업 숨김
    }
  };

  const handleRetry = () => {
    // 실패한 단계부터 재시작
    setError(undefined);
    setLoading(true);
    setIsManuallyHidden(false);
    setIsVisible(true);
    // convert/page.tsx에서 stageResults를 보고 자동으로 재개됨
    window.location.href = '/convert';
  };

  if (!mounted) return null;

  // 변환 중이 아니거나 수동으로 닫혔으면 표시 안 함
  if (!isVisible || isManuallyHidden) {
    return null;
  }

  const isCompleted = currentStep === 'completed';
  const isFailed = !!error;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px]" role="status" aria-live="polite">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900">
              {isCompleted ? '✅ 변환 완료' : '🎬 변환 진행 중'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-700 rounded-full p-1.5 hover:bg-gray-100 transition-all"
              aria-label="변환 취소"
              title="변환 취소"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {isFailed && <p className="text-xs text-red-600 mt-1 font-medium">⚠️ 오류 발생</p>}
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 space-y-4">
          {/* 현재 단계 */}
          <div className="space-y-3">
            <p className="text-gray-900 font-semibold text-sm">{stepNames[currentStep] || currentStep}</p>

          {/* 프로그레스 바 */}
            {!isCompleted && !isFailed && (
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-[color:var(--accent)] to-blue-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* 진행률 표시 */}
            {!isCompleted && !isFailed && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-600">{progress}% 완료</p>
                
                {/* 상세 진행도 (슬라이드 처리) */}
                {detailedProgress && detailedProgress.total > 0 && (
                  <div className="text-xs space-y-1.5 bg-blue-50/60 backdrop-blur-sm p-3 rounded-lg border border-blue-100">
                    <p className="font-bold text-blue-900">
                      {detailedProgress.current}/{detailedProgress.total}
                    </p>
                    <p className="text-blue-700">{detailedProgress.details}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 에러 메시지 */}
          {isFailed && (
            <div className="bg-red-50/80 backdrop-blur-sm text-red-700 p-4 rounded-xl text-sm border border-red-200 space-y-3">
              <p className="font-bold mb-1">❌ 변환 중 오류가 발생했습니다</p>
              <p className="text-xs">{error}</p>
              <p className="text-xs mt-2 text-gray-600">
                💡 완료된 단계는 건너뛰고 실패 단계부터 재시도합니다.
              </p>

              <button
                onClick={handleRetry}
                className="w-full mt-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                🔄 재시도
              </button>
            </div>
          )}

          {/* 완료 메시지 */}
          {isCompleted && videoUrl && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200 space-y-3">
              <p className="text-sm text-gray-800 font-medium">🎉 모든 변환 작업이 완료되었습니다.</p>
              <Link
                href={`/dashboard?project=${projectId || 'latest'}`}
                className="block w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all text-center shadow-md hover:shadow-lg"
              >
                📊 대시보드에서 결과 확인
              </Link>
            </div>
          )}

          {/* 변환 중 힌트 */}
          {!isCompleted && !isFailed && (
            <div className="bg-blue-50/60 backdrop-blur-sm p-3 rounded-lg text-xs text-blue-800 border border-blue-100">
              💡 다른 페이지로 이동해도 변환은 계속 진행됩니다.
            </div>
          )}
        </div>

        {/* 닫기 버튼 */}
        <div className="px-6 py-3 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm border-t border-gray-200/60">
          <button
            onClick={() => {
              if (isCompleted || isFailed) {
                setIsVisible(false);
                if (isFailed) {
                  // 에러 발생 시 상태 완전 초기화하여 새 변환 가능하게
                  resetConversion();
                }
              }
            }}
            disabled={!isCompleted && !isFailed}
            className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              isCompleted || isFailed
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-900 cursor-pointer shadow-sm hover:shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isCompleted || isFailed ? '닫기' : '🎬 변환 진행 중...'}
          </button>
        </div>
      </div>
    </div>
  );
};
