'use client';

import { Navigation } from '@/components/Navigation';
import { ConversionSteps } from '@/components/ConversionSteps';
import { Footer } from '@/components/Footer';

export default function ConvertPage() {
  return (
    <>
      <Navigation isLoggedIn={true} />
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12">PPT를 영상으로 변환</h1>
          <ConversionSteps currentStep={1} />
          
          <div className="mt-12 p-8 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 text-center">
            <p className="text-gray-600 mb-4">PPT 파일을 여기에 드래그하거나 클릭해서 업로드</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              파일 선택
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
