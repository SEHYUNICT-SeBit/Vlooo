'use client';

import { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSocialLogin = (provider: string) => {
    setMessage(`[데모 모드] ${provider} 로그인은 UI만 표시됩니다.`);
  };

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('[데모 모드] 이메일 로그인은 UI만 표시됩니다.');
  };

  const handleClose = () => {
    setShowEmailForm(false);
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 mx-4 border border-[color:var(--line)]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition"
          aria-label="닫기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-lg border border-[color:var(--line)] bg-[color:var(--surface)] mb-4 h-12 w-12">
            <span className="text-lg font-bold text-[color:var(--accent)]">V</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Vlooo에 가입하고 무료로 무제한 창작을 즐기세요</h1>
        </div>

        {/* Login Options */}
        <div className="space-y-3">
          {/* Google Login */}
          <button
            onClick={() => handleSocialLogin('Google')}
            className="w-full rounded-lg bg-white border border-[color:var(--line)] text-gray-900 py-3 px-4 text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <text x="12" y="18" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">
                G
              </text>
            </svg>
            Google 계정으로 로그인
          </button>

          {/* Microsoft Login */}
          <button
            onClick={() => handleSocialLogin('Microsoft')}
            className="w-full rounded-lg bg-white border border-[color:var(--line)] text-gray-900 py-3 px-4 text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <text x="12" y="18" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">
                M
              </text>
            </svg>
            Microsoft계정으로 로그인
          </button>

          {/* Facebook Login */}
          <button
            onClick={() => handleSocialLogin('Facebook')}
            className="w-full rounded-lg bg-white border border-[color:var(--line)] text-gray-900 py-3 px-4 text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <text x="12" y="18" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">
                f
              </text>
            </svg>
            Facebook으로 로그인
          </button>

          {/* GitHub Login */}
          <button
            onClick={() => handleSocialLogin('GitHub')}
            className="w-full rounded-lg bg-white border border-[color:var(--line)] text-gray-900 py-3 px-4 text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <text x="12" y="18" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">
                @
              </text>
            </svg>
            GitHub로 로그인
          </button>

          {/* Apple Login */}
          <button
            onClick={() => handleSocialLogin('Apple')}
            className="w-full rounded-lg bg-white border border-[color:var(--line)] text-gray-900 py-3 px-4 text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <text x="12" y="18" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">
                🍎
              </text>
            </svg>
            애플 계정으로 로그인하세요
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[color:var(--line)]"></div>
            <span className="text-sm text-[color:var(--muted)]">또는</span>
            <div className="flex-1 h-px bg-[color:var(--line)]"></div>
          </div>

          {/* Email Option */}
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full rounded-lg bg-white border border-[color:var(--line)] text-gray-900 py-3 px-4 text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
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
                className="w-full rounded-lg border border-[color:var(--line)] bg-white text-gray-900 py-3 px-4 text-sm placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                required
                autoFocus
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-[color:var(--accent)] text-white py-3 px-4 text-sm font-semibold hover:bg-[color:var(--accent-strong)] transition"
              >
                이메일로 계속하세요
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(false);
                  setEmail('');
                }}
                className="w-full text-sm text-[color:var(--muted)] hover:text-gray-900"
              >
                취소
              </button>
            </form>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm text-center">
            {message}
          </div>
        )}

        {/* Terms */}
        <div className="mt-6 text-center text-xs text-[color:var(--muted)]">
          <p>
            <input type="checkbox" className="mr-2" defaultChecked />
            <span>회원가입 시 당사의</span>
            <a href="#" className="text-gray-900 hover:text-[color:var(--accent)] ml-1">
              서비스 약관
            </a>
            <span>및</span>
            <a href="#" className="text-gray-900 hover:text-[color:var(--accent)] ml-1">
              개인정보 처리방침
            </a>
            <span>에 동의합니다</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
