/**
 * ErrorDisplay.tsx
 * 에러 메시지 표시 및 재시도 옵션
 */

'use client';

import React from 'react';

interface ErrorDisplayProps {
  error?: string;
  retryCount?: number;
  onRetry?: () => void;
  onDismiss?: () => void;
  severity?: 'error' | 'warning' | 'info';
}

const errorColors = {
  error: {
    container: 'bg-red-50 border-red-200',
    icon: '❌',
    textColor: 'text-red-800',
    buttonColor: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: '⚠️',
    textColor: 'text-yellow-800',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'ℹ️',
    textColor: 'text-blue-800',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  retryCount = 0,
  onRetry,
  onDismiss,
  severity = 'error',
}) => {
  if (!error) return null;

  const colors = errorColors[severity];

  return (
    <div
      className={`
        border-l-4 rounded-lg p-6 mb-6
        ${colors.container}
      `}
    >
      {/* 에러 헤더 */}
      <div className="flex items-start gap-4">
        <div className="text-4xl">{colors.icon}</div>

        <div className="flex-1">
          {/* 에러 제목 */}
          <h4 className={`font-bold ${colors.textColor} mb-2`}>
            {severity === 'error' && '변환 중 오류가 발생했습니다'}
            {severity === 'warning' && '경고'}
            {severity === 'info' && '알림'}
          </h4>

          {/* 에러 메시지 */}
          <p className={colors.textColor}>{error}</p>

          {/* 시도 횟수 표시 */}
          {retryCount > 0 && severity === 'error' && (
            <p className={`text-sm ${colors.textColor} opacity-75 mt-2`}>
              재시도 횟수: {retryCount}회
            </p>
          )}
        </div>

        {/* 닫기 버튼 */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`text-xl ${colors.textColor} hover:opacity-75 transition-opacity`}
            aria-label="닫기"
          >
            ✕
          </button>
        )}
      </div>

      {/* 액션 버튼 */}
      {(onRetry || onDismiss) && (
        <div className="mt-4 flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`
                ${colors.buttonColor} text-white px-6 py-2 rounded-lg
                font-semibold transition-colors
              `}
            >
              🔄 재시도
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`
                border-2 ${colors.container} ${colors.textColor} px-6 py-2 rounded-lg
                font-semibold transition-colors hover:opacity-75
              `}
            >
              닫기
            </button>
          )}
        </div>
      )}

      {/* 상세 정보 (개발 환경) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-xs text-gray-600">
          <summary className="cursor-pointer font-semibold">상세 정보</summary>
          <pre className="mt-2 bg-white p-3 rounded overflow-auto max-h-32 border border-gray-300">
            {error}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ErrorDisplay;
