/**
 * ResultsDisplay.tsx
 * 최종 결과물 (영상, 스크립트, 음성) 표시 및 다운로드
 */

'use client';

import React, { useState } from 'react';
import { useConversionResults } from '@/context/ConversionStore';

interface ResultsDisplayProps {
  videoUrl?: string;
  audioUrls?: Array<{
    slideId: string;
    slideNumber: number;
    audioUrl: string;
    duration: number;
  }>;
  scripts?: Array<{
    slideId: string;
    slideNumber: number;
    scriptText: string;
    duration?: number;
  }>;
  projectName?: string;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  videoUrl,
  audioUrls,
  scripts,
  projectName = 'My Project',
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 완료 헤더 */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-3xl font-bold text-green-900 mb-2">변환이 완료되었습니다!</h2>
        <p className="text-green-700">&quot;{projectName}&quot; 프로젝트가 성공적으로 처리되었습니다.</p>
      </div>

      {/* 최종 영상 */}
      {videoUrl && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gray-900 p-8 flex items-center justify-center">
            <div className="w-full max-w-2xl">
              {/* 비디오 플레이어 */}
              <video
                controls
                className="w-full rounded-lg bg-black"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect fill='%23404040' width='16' height='9'/%3E%3Cpath d='M6 3v3l2.5-1.5z' fill='%231ed760'/%3E%3C/svg%3E"
              >
                <source src={videoUrl} type="video/mp4" />
                <p>영상을 재생할 수 없습니다. 브라우저에서 HTML5 비디오를 지원해주세요.</p>
              </video>
            </div>
          </div>

          {/* 영상 다운로드 */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">최종 영상</h3>
                <p className="text-sm text-gray-600">MP4 형식, 1080p</p>
              </div>
              <button
                onClick={() => downloadFile(videoUrl, `${projectName}_final.mp4`)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                💾 다운로드
              </button>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg break-all text-sm text-gray-600">
              <code>{videoUrl}</code>
            </div>
          </div>
        </div>
      )}

      {/* 음성 파일들 */}
      {audioUrls && audioUrls.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-lg mb-2">📁 음성 파일</h3>
            <p className="text-sm text-gray-600">각 슬라이드별 생성된 음성 파일</p>
          </div>

          <div className="divide-y">
            {audioUrls.map((audio, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      슬라이드 {audio.slideNumber} 음성
                    </p>
                    <p className="text-sm text-gray-600">
                      재생 시간: {Math.floor(audio.duration / 60)}분 {Math.floor(audio.duration % 60)}초
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(audio.audioUrl, index)}
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors text-sm"
                    >
                      {copiedIndex === index ? '✓ 복사됨' : '📋 URL 복사'}
                    </button>
                    <button
                      onClick={() =>
                        downloadFile(audio.audioUrl, `${projectName}_slide${audio.slideNumber}.mp3`)
                      }
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                    >
                      💾 다운로드
                    </button>
                  </div>
                </div>

                {/* 미니 음성 플레이어 */}
                <audio controls className="mt-3 w-full h-8">
                  <source src={audio.audioUrl} type="audio/mpeg" />
                  <p>음성을 재생할 수 없습니다.</p>
                </audio>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 스크립트 */}
      {scripts && scripts.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-lg mb-2">📝 스크립트</h3>
            <p className="text-sm text-gray-600">AI가 생성한 나레이션 스크립트</p>
          </div>

          <div className="divide-y">
            {scripts.map((script, index) => (
              <details
                key={index}
                className="border-none p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <summary className="font-semibold text-gray-900 flex justify-between items-center">
                  <span>슬라이드 {script.slideNumber} 스크립트</span>
                  <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>

                <div className="mt-4 space-y-3">
                  {/* 스크립트 텍스트 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {script.scriptText}
                    </p>
                  </div>

                  {/* 정보 */}
                  <div className="flex gap-4 text-sm text-gray-600">
                    {script.duration && (
                      <div>
                        <span className="font-semibold">예상 재생 시간:</span>{' '}
                        {script.duration}초
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <button
                    onClick={() => copyToClipboard(script.scriptText, index)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors text-sm font-semibold"
                  >
                    {copiedIndex === index ? '✓ 복사됨' : '📋 스크립트 복사'}
                  </button>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* 공유 & 다음 단계 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">🎉 다음 단계</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>생성된 영상을 검토하고 수정이 필요하시면 다시 변환해보세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>SNS, YouTube, 프레젠테이션 등 다양한 플랫폼에서 사용할 수 있습니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>추가 편집이 필요한 경우 비디오 편집 소프트웨어를 사용하세요</span>
          </li>
        </ul>

        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            🏠 홈으로 돌아가기
          </button>
          <button className="flex-1 border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
            🆕 새 프로젝트 만들기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
