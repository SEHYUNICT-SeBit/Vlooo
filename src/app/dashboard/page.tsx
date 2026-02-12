'use client';

import { useEffect, useState } from 'react';
import { useConversionStore } from '@/context/ConversionStore';
import { apiClient } from '@/services/api';
import Link from 'next/link';

export default function DashboardPage() {
  const {
    currentStep,
    projectId,
    videoUrl,
    uploadedFile,
    scripts,
    setVideoUrl,
    setCurrentStep,
  } = useConversionStore();
  const [statusChecked, setStatusChecked] = useState(false);

  useEffect(() => {
    if (!projectId || videoUrl || statusChecked) {
      return;
    }

    let isMounted = true;

    const loadStatus = async () => {
      try {
        const status = await apiClient.getProjectStatus(projectId);
        const renderedUrl = status?.results?.videoUrl;

        if (renderedUrl && isMounted) {
          setVideoUrl(renderedUrl);
          setCurrentStep('completed');
        }
      } catch (error) {
        console.warn('Failed to load project status for dashboard.', error);
      } finally {
        if (isMounted) {
          setStatusChecked(true);
        }
      }
    };

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, [projectId, videoUrl, statusChecked, setVideoUrl, setCurrentStep]);

  const isConversionInProgress = currentStep !== 'upload' && currentStep !== 'completed';

  return (
    <>
      <div className="min-h-screen bg-[color:var(--surface)] py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
              Dashboard
            </p>
            <h1 className="text-4xl font-semibold text-gray-900">대시보드</h1>
            <p className="text-sm text-[color:var(--muted)]">완료된 프로젝트를 확인하고 다운로드하세요.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[color:var(--line)] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold text-[color:var(--muted)]">총 프로젝트</p>
              <p className="text-3xl font-semibold text-gray-900 mt-3">1</p>
            </div>
            <div className="rounded-2xl border border-[color:var(--line)] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold text-[color:var(--muted)]">변환 완료</p>
              <p className="text-3xl font-semibold text-gray-900 mt-3">{videoUrl ? 1 : 0}</p>
            </div>
            <div className="rounded-2xl border border-[color:var(--line)] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold text-[color:var(--muted)]">현재 상태</p>
              <p className="text-lg font-semibold text-gray-900 mt-4">
                {isConversionInProgress
                  ? '변환 진행 중'
                  : currentStep === 'completed'
                    ? '완료'
                    : '대기'}
              </p>
            </div>
          </div>

          {isConversionInProgress && (
            <div className="rounded-2xl border border-[color:var(--line)] bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">변환이 진행 중입니다</h3>
              <p className="text-sm text-[color:var(--muted)] mt-2">
                현재 {uploadedFile?.name} 파일을 처리하고 있습니다. 팝업에서 진행 상황을 확인할 수 있습니다.
              </p>
            </div>
          )}

          {videoUrl && (
            <div className="rounded-3xl border border-[color:var(--line)] bg-white p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-gray-900">최신 변환 결과</h2>
                  <p className="text-sm text-[color:var(--muted)]">다운로드 링크는 24시간 유지됩니다.</p>
                </div>
                <a
                  href={videoUrl}
                  download={`${uploadedFile?.name?.replace(/\.[^.]+$/, '') || 'presentation'}.mp4`}
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[color:var(--accent-strong)] transition"
                >
                  MP4 다운로드
                </a>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                  <p className="text-xs font-semibold text-[color:var(--muted)]">프로젝트 ID</p>
                  <p className="mt-2 text-sm font-mono text-gray-800 break-all">{projectId}</p>
                </div>
                <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                  <p className="text-xs font-semibold text-[color:var(--muted)]">원본 파일</p>
                  <p className="mt-2 text-sm text-gray-800">{uploadedFile?.name || 'Unknown'}</p>
                </div>
                <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                  <p className="text-xs font-semibold text-[color:var(--muted)]">슬라이드 수</p>
                  <p className="mt-2 text-sm text-gray-800">{scripts?.length || 0}개</p>
                </div>
                <div className="rounded-2xl bg-[color:var(--surface)] p-6">
                  <p className="text-xs font-semibold text-[color:var(--muted)]">해상도</p>
                  <p className="mt-2 text-sm text-gray-800">1080p</p>
                </div>
              </div>
            </div>
          )}

          {!videoUrl && !isConversionInProgress && (
            <div className="rounded-3xl border border-[color:var(--line)] bg-white p-12 text-center">
              <h3 className="text-2xl font-semibold text-gray-900">아직 변환된 프로젝트가 없습니다</h3>
              <p className="text-sm text-[color:var(--muted)] mt-2">
                PPT를 업로드하면 자동으로 전문가 영상이 생성됩니다.
              </p>
              <Link
                href="/convert"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[color:var(--accent-strong)] transition"
              >
                변환 시작
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
