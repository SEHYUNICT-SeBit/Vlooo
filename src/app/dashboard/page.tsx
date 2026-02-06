'use client';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">대시보드</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">총 프로젝트</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">이번 달 변환</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">남은 크레딧</h3>
          <p className="text-3xl font-bold text-orange-600">100</p>
        </div>
      </div>
    </div>
  );
}
