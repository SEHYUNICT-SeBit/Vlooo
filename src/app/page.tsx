'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navigation isLoggedIn={false} />
      <main className="min-h-screen">
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">내 PPT가 전문가의 영상으로 흐르다</h1>
            <p className="text-xl mb-8 opacity-90">
              AI 기반 PPT 변환 서비스로 전문가급 프레젠테이션 영상을 만드세요
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
              지금 시작하기
            </button>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Vlooo의 특징</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">🎬</div>
                <h3 className="text-xl font-bold mb-2">자동 영상 변환</h3>
                <p className="text-gray-600">PPT를 AI가 분석하여 전문적인 영상으로 변환</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">🎙️</div>
                <h3 className="text-xl font-bold mb-2">AI 보이스오버</h3>
                <p className="text-gray-600">자연스러운 한국어 음성으로 나레이션 제공</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-2">빠른 처리</h3>
                <p className="text-gray-600">몇 분 안에 고품질 영상 완성</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
