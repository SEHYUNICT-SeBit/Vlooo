/**
 * ProgressDisplay.tsx
 * 변환 진행률 및 현재 단계 표시
 */

'use client';

import React from 'react';
import { useProgress, useCurrentStep } from '@/context/ConversionStore';

interface ProgressDisplayProps {
  showDetails?: boolean;
}

const STEP_DETAILS: Record<string, { icon: string; description: string }> = {
  upload: { icon: '', description: 'PPT 파일을 업로드합니다' },
  parsing: { icon: '', description: '슬라이드와 콘텐츠를 분석합니다' },
  scripting: { icon: '', description: 'AI가 나레이션 스크립트를 작성합니다' },
  'voice-synthesis': { icon: '', description: '스크립트를 음성으로 변환합니다' },
  rendering: { icon: '', description: '최종 영상을 렌더링합니다' },
  completed: { icon: '', description: '영상 변환이 완료되었습니다!' },
};

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ showDetails = true }) => {
  const { progress, currentStep, loading } = useProgress();
  const { stepName } = useCurrentStep();
  const detail = STEP_DETAILS[currentStep];

  return (
    <div className="w-full">
      {/* 상단 진행률 바 (고정) */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            {detail?.icon && <div className="text-2xl">{detail.icon}</div>}
            <div>
              <h3 className="font-bold text-gray-900">{stepName}</h3>
              {showDetails && <p className="text-sm text-gray-600">{detail?.description}</p>}
            </div>
            {loading && (
              <div className="ml-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[color:var(--accent)]">{progress}%</div>
            <p className="text-xs text-gray-500">진행 중</p>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-[color:var(--accent)] h-full transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 단계별 진행 표시 */}
      {showDetails && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-bold text-gray-900 mb-4">변환 단계</h4>
          <div className="space-y-3">
            {Object.entries(STEP_DETAILS).map(([step, { icon, description }]) => {
              const stepOrder = Object.keys(STEP_DETAILS);
              const currentIndex = stepOrder.indexOf(currentStep);
              const stepIndex = stepOrder.indexOf(step);

              let status: 'completed' | 'current' | 'pending' = 'pending';
              if (stepIndex < currentIndex) status = 'completed';
              else if (stepIndex === currentIndex) status = 'current';

              return (
                <div
                  key={step}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all
                    ${
                      status === 'completed'
                        ? 'bg-green-50 border border-green-200'
                        : status === 'current'
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-100 border border-gray-300 opacity-60'
                    }
                  `}
                >
                  {/* 상태 아이콘 */}
                  <div
                    className={`
                      flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm
                      ${
                        status === 'completed'
                          ? 'bg-green-500 text-white'
                          : status === 'current'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-400 text-white'
                      }
                    `}
                  >
                    {status === 'completed' ? '✓' : stepIndex + 1}
                  </div>

                  {/* 단계 정보 */}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{description}</div>
                    {status === 'current' && <p className="text-xs text-blue-600">처리 중...</p>}
                  </div>

                  {/* 단계 아이콘 */}
                  <div className="text-xl">{icon}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDisplay;
