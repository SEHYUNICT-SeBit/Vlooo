'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const singlePurchasePlans = [
  {
    id: 'single-1',
    name: '단건 1회',
    price: '9,900',
    unit: '원',
    description: '1개의 PPT를 영상으로 변환',
    features: ['720p 기본 출력', '기본 음성 1종', '표준 렌더링'],
  },
  {
    id: 'single-5',
    name: '단건 5회',
    price: '39,000',
    unit: '원',
    description: '5개의 PPT를 영상으로 변환',
    features: ['1080p 출력', '음성 2종 선택', '우선 렌더링'],
    highlight: true,
  },
  {
    id: 'single-10',
    name: '단건 10회',
    price: '69,000',
    unit: '원',
    description: '10개의 PPT를 영상으로 변환',
    features: ['1080p 출력', '음성 3종 선택', '우선 렌더링'],
  },
];

const subscriptionPlans = [
  {
    id: 'sub-10',
    name: '월 10건',
    price: '49,000',
    unit: '원 / 월',
    description: '월 10건까지 변환',
    features: ['1080p 출력', '음성 3종 선택', '우선 렌더링', '월간 리포트'],
  },
  {
    id: 'sub-30',
    name: '월 30건',
    price: '129,000',
    unit: '원 / 월',
    description: '월 30건까지 변환',
    features: ['1080p 출력', '음성 5종 선택', '빠른 렌더링', '월간 리포트'],
    highlight: true,
  },
  {
    id: 'sub-unlimited',
    name: '무제한',
    price: '249,000',
    unit: '원 / 월',
    description: '제한 없이 변환',
    features: ['4K 출력', '프리미엄 음성', '최우선 렌더링', '전담 지원'],
  },
];

function PlanCard({
  name,
  price,
  unit,
  description,
  features,
  highlight = false,
}: {
  name: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={
        `rounded-2xl border p-6 shadow-sm bg-white ` +
        (highlight
          ? 'border-blue-600 ring-2 ring-blue-200'
          : 'border-gray-200')
      }
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        {highlight && (
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            추천
          </span>
        )}
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900">
          {price}
          <span className="text-sm font-medium text-gray-500 ml-2">{unit}</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm text-gray-700 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className="w-full py-3 rounded-lg font-semibold bg-gray-200 text-gray-600 cursor-not-allowed"
        disabled
      >
        결제 준비중
      </button>
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">요금제</h1>
            <p className="text-gray-600">
              단건 결제와 구독형 요금제를 모두 제공합니다. 결제는 곧 오픈됩니다.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-12">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚧</span>
              <div>
                <h2 className="font-bold text-yellow-900">결제 준비중</h2>
                <p className="text-yellow-700 text-sm">
                  현재 다양한 결제 플랫폼 연동을 준비하고 있습니다. 업데이트 소식을 알려드릴게요.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">단건 결제</h2>
              <span className="text-sm text-gray-500">필요할 때만 결제</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {singlePurchasePlans.map((plan) => (
                <PlanCard key={plan.id} {...plan} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">구독형 요금제</h2>
              <span className="text-sm text-gray-500">정기적으로 대량 변환</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <PlanCard key={plan.id} {...plan} />
              ))}
            </div>
          </section>

          <section className="mt-16 bg-white rounded-2xl border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">결제 플랫폼 확장</h3>
            <p className="text-gray-600 mb-4">
              Stripe, 토스페이먼츠, 포트원 등 다양한 결제 플랫폼과 연동할 수 있도록 설계했습니다.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-semibold mb-2">단건 결제</p>
                <p>카드/간편결제/계좌이체</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-semibold mb-2">구독 결제</p>
                <p>월 자동 결제 및 사용량 추적</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="font-semibold mb-2">영수증/세금계산서</p>
                <p>기업 고객용 증빙 지원</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
