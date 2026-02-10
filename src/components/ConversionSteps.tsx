/**
 * ConversionSteps.tsx
 * Vlooo 변환 프로세스 단계 표시 컴포넌트
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { CONVERSION_STEPS } from '@/data/menuItems';

interface ConversionStepsProps {
  currentStep?: number | string;
}

export const ConversionSteps: React.FC<ConversionStepsProps> = ({ currentStep = 1 }) => {
  const getStepNumber = (id: string): number => {
    const match = id.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const currentStepNum = Number(currentStep);

  return (
    <div className="bg-white rounded-lg p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6">변환 프로세스</h2>

      {/* 모바일 및 데스크톱 버전 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {CONVERSION_STEPS.map((step, index) => {
          const stepNumber = getStepNumber(step.id);
          const isCompleted = stepNumber < currentStepNum;
          const isCurrent = stepNumber === currentStepNum;

          return (
            <div key={index} className="flex-1">
              <Link href={step.path || '#'}>
                <div
                  className={`
                    p-4 rounded-lg border-2 transition-all cursor-pointer
                    ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50'
                        : isCompleted
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50 opacity-50'
                    }
                  `}
                >
                  {/* 단계 번호 */}
                  <div
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full font-bold mb-2
                      ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                      }
                    `}
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </div>

                  {/* 단계 제목 */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{step.label}</h3>

                  {/* 설명 */}
                  <p className="text-xs text-gray-600">{step.description}</p>

                  {/* 배지 */}
                  {step.badge && (
                    <div className="mt-2">
                      <span className="inline-block text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {step.badge}
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* 연결선 (마지막 단계 제외) */}
              {index < CONVERSION_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-300"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* 진행 상황 표시 */}
      <div className="mt-6 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${(currentStepNum / CONVERSION_STEPS.length) * 100}%` }}
        ></div>
      </div>

      <div className="text-center mt-2 text-sm text-gray-600">
        {currentStepNum}단계 / {CONVERSION_STEPS.length}단계
      </div>
    </div>
  );
};

export default ConversionSteps;
