'use client';

import { useFileUploadModal } from '@/context/FileUploadModalContext';

export default function Home() {
  const { openModal } = useFileUploadModal();

  return (
    <>

      <section className="relative overflow-hidden">
        <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-[color:var(--highlight)]/25 blur-3xl" />
        <div className="absolute bottom-10 left-0 h-64 w-64 rounded-full bg-[color:var(--accent)]/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-3 py-1 text-xs font-semibold text-[color:var(--accent)]">
                Vlooo가 만들어 드립니다
              </div>
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-gray-900">
                누구나 PT 전문가로
                <br />
                당신은 문서만 준비해주세요
              </h1>
              <div className="text-base text-[color:var(--muted)] max-w-xl space-y-2">
                <div>음성 인식 기능을 통한 자막 자동 생성</div>
                <div>직접 녹음하지 않아도 되는 500여 개의 AI 목소리</div>
                <div>상업적으로 사용가능한 무료 이미지, 비디오, 배경 음악</div>
                <div>AI가 대본과 영상을 한 번에, 텍스트로 비디오 만들기</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={openModal}
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[color:var(--accent-strong)] transition"
                >
                  동영상만들기
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-[color:var(--line)] bg-white overflow-hidden shadow-sm">
              <div className="relative w-full pb-[56.25%] bg-black">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/QXJ9156chzk"
                  title="Vlooo - 동영상 만들기"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
                What Vlooo Does
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900">
                반복 작업은 AI가 대신합니다
              </h2>
            </div>
            <p className="text-sm text-[color:var(--muted)] max-w-md">
              스크립트 작성, 음성 제작, 렌더링까지 한 번에 연결합니다.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: '자동 스크립트',
                desc: '슬라이드 내용에 맞춰 발표 대본을 구성합니다.',
              },
              {
                title: 'AI 음성 합성',
                desc: '자연스러운 한국어 목소리를 바로 적용합니다.',
              },
              {
                title: '빠른 렌더링',
                desc: '1080p 기준 수 분 내로 결과를 제공합니다.',
              },
              {
                title: '결과 동기화',
                desc: '완료된 영상은 대시보드에서 바로 확인합니다.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[color:var(--line)] bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-[color:var(--muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
                Use Cases
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900">
                이렇게 활용하세요
              </h2>
            </div>
            <p className="text-sm text-[color:var(--muted)] max-w-md">
              교육, 세일즈, 콘텐츠 제작까지 다양한 현장에서 쓸 수 있습니다.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: '사내 교육',
                desc: '반복되는 교육 자료를 영상으로 전환해 시간을 절약합니다.',
              },
              {
                title: '세일즈/마케팅',
                desc: '제품 발표 자료를 빠르게 영상 콘텐츠로 바꿉니다.',
              },
              {
                title: '온라인 강의',
                desc: '강의용 PPT를 자동으로 강의 영상화합니다.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[color:var(--line)] p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-[color:var(--muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-3xl border border-[color:var(--line)] bg-white p-10 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900">지금 바로 시작하세요</h2>
              <p className="text-sm text-[color:var(--muted)] mt-2">
                PPT만 있으면 어디서든 전문가 영상으로 완성됩니다.
              </p>
            </div>
            <button
              onClick={openModal}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[color:var(--accent-strong)] transition"
            >
              변환 시작
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
