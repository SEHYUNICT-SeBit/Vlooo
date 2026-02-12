'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function LoginPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSocialLogin = (provider: string) => {
    setMessage(`[데모 모드] ${provider} 로그인은 UI만 표시됩니다.`);
  };

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('[데모 모드] 이메일 로그인은 UI만 표시됩니다.');
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-6 py-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center rounded-lg bg-white mb-4">
              <span className="flex h-12 w-12 items-center justify-center text-lg font-bold text-[color:var(--accent)]">
                V
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">Vlooo에 가입하고 무료로 무제한 창작을 즐기세요</h1>
          </div>

          <div className="space-y-3">
            {/* Google Login */}
            <button
              onClick={() => handleSocialLogin('Google')}
              className="w-full rounded-lg bg-white text-gray-900 py-3 px-4 text-sm font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <text x="12" y="18" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">G</text>
              </svg>
              Google 계정으로 로그인
            </button>

            {/* Microsoft Login */}
            <button
              onClick={() => handleSocialLogin('Microsoft')}
              className="w-full rounded-lg bg-gray-700 text-white py-3 px-4 text-sm font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <text x="12" y="18" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">M</text>
              </svg>
              Microsoft계정으로 로그인
            </button>

            {/* Facebook Login */}
            <button
              onClick={() => handleSocialLogin('Facebook')}
              className="w-full rounded-lg bg-gray-700 text-white py-3 px-4 text-sm font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <text x="12" y="18" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">f</text>
              </svg>
              Facebook으로 로그인
            </button>

            {/* GitHub Login */}
            <button
              onClick={() => handleSocialLogin('GitHub')}
              className="w-full rounded-lg bg-gray-700 text-white py-3 px-4 text-sm font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <text x="12" y="18" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">@</text>
              </svg>
              GitHub로 로그인
            </button>

            {/* Apple Login */}
            <button
              onClick={() => handleSocialLogin('Apple')}
              className="w-full rounded-lg bg-gray-700 text-white py-3 px-4 text-sm font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <text x="12" y="18" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">🍎</text>
              </svg>
              애플 계정으로 로그인하세요
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-600"></div>
              <span className="text-sm text-gray-400">또는</span>
              <div className="flex-1 h-px bg-gray-600"></div>
            </div>

            {/* Email Option */}
            {!showEmailForm ? (
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full rounded-lg bg-gray-700 text-white py-3 px-4 text-sm font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                이메일
              </button>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  className="w-full rounded-lg bg-gray-700 text-white py-3 px-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gray-600 text-white py-3 px-4 text-sm font-semibold hover:bg-gray-500 transition"
                >
                  이메일로 계속하세요
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false);
                    setEmail('');
                  }}
                  className="w-full text-sm text-gray-400 hover:text-gray-300"
                >
                  취소
                </button>
              </form>
            )}
          </div>

          {message && (
            <div className="mt-4 p-3 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-300 text-sm text-center">
              {message}
            </div>
          )}

          {/* Terms */}
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>
              <input type="checkbox" className="mr-2" defaultChecked />
              <span>회원가입 시 당사의</span>
              <a href="#" className="text-gray-300 hover:text-white ml-1">
                서비스 약관
              </a>
              <span>및</span>
              <a href="#" className="text-gray-300 hover:text-white ml-1">
                개인정보 처리방침
              </a>
              <span>에 동의합니다</span>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
