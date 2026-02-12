/**
 * Navigation.tsx
 * Vlooo 메인 네비게이션 컴포넌트
 * Next.js + React + TypeScript로 작성
 */

'use client';

import React from 'react';
import Link from 'next/link';

interface NavigationProps {
  isLoggedIn?: boolean;
  showSidebarToggle?: boolean;
  onToggleSidebar?: () => void;
  onLoginClick?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isLoggedIn = false,
  showSidebarToggle = false,
  onToggleSidebar,
  onLoginClick,
}) => {
  // 로그인 기능 비활성화

  return (
    <nav className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--muted)] text-[9px] font-semibold">
              LOGO
            </span>
            <span className="text-lg font-bold text-gray-900">Vlooo</span>
          </Link>
          {showSidebarToggle && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--line)] text-gray-700 hover:text-[color:var(--accent)] hover:border-[color:var(--accent)] transition"
              aria-label="메뉴 펼치기 또는 접기"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onLoginClick}
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] px-4 py-2 text-sm font-semibold text-gray-800 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition"
          >
            로그인
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
