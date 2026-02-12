/**
 * Footer.tsx
 * Vlooo 푸터 메뉴 컴포넌트
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { FOOTER_MENU } from '@/data/menuItems';

export const Footer: React.FC = () => {
  const socialItem = FOOTER_MENU.find((item) => item.id === 'social');
  const regularItems = FOOTER_MENU.filter((item) => item.id !== 'social');

  return (
    <footer className="bg-[#101514] text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr] gap-10">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 text-white text-xl font-semibold">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--accent)] text-white">
                V
              </span>
              Vlooo
            </Link>
            <p className="text-sm text-gray-400">내 PPT가 전문가의 영상으로 흐르다</p>
            <div className="flex items-center gap-3">
              <Link
                href="/convert"
                className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
              >
                변환 시작
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:border-white/50 transition"
              >
                요금 안내
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">회사</h4>
            <ul className="space-y-2 text-sm">
              {regularItems.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <Link href={item.path || '#'} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">정책</h4>
            <ul className="space-y-2 text-sm">
              {regularItems.slice(3).map((item) => (
                <li key={item.id}>
                  <Link href={item.path || '#'} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          {socialItem && (
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span>팔로우</span>
              {socialItem.children?.map((social) => (
                <Link
                  key={social.id}
                  href={social.path || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {social.label}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500">
            <p>© 2026 Vlooo. 모든 권리 보유.</p>
            <p className="mt-2">
              문의가 필요하면{' '}
              <Link href="/support/contact" className="text-white hover:text-gray-200">
                고객지원팀
              </Link>
              으로 연락주세요.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
