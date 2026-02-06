/**
 * Footer.tsx
 * Vlooo 푸터 메뉴 컴포넌트
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { FOOTER_MENU } from '@/data/menuItems';

export const Footer: React.FC = () => {
  // 소셜 미디어 항목 찾기
  const socialItem = FOOTER_MENU.find((item) => item.id === 'social');
  const regularItems = FOOTER_MENU.filter((item) => item.id !== 'social');

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 메인 푸터 컨텐츠 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* 브랜드 정보 */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-white mb-4">
              <span>🎬</span>
              <span>Vlooo</span>
            </Link>
            <p className="text-sm text-gray-400">
              내 PPT가 전문가의 영상으로 흐르다
            </p>
            <p className="text-xs text-gray-500 mt-2">
              © 2026 Vlooo. 모든 권리 보유.
            </p>
          </div>

          {/* 링크 열 1 */}
          <div>
            <h4 className="font-semibold text-white mb-4">회사</h4>
            <ul className="space-y-2">
              {regularItems.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.path || '#'}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 링크 열 2 */}
          <div>
            <h4 className="font-semibold text-white mb-4">정책</h4>
            <ul className="space-y-2">
              {regularItems.slice(3).map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.path || '#'}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-700 py-8">
          {/* 소셜 미디어 */}
          {socialItem && (
            <div className="flex items-center justify-center gap-6 mb-6">
              <span className="text-sm text-gray-400">팔로우하기:</span>
              {socialItem.children?.map((social) => (
                <Link
                  key={social.id}
                  href={social.path || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title={social.label}
                >
                  <span className="text-xl">{social.icon}</span>
                </Link>
              ))}
            </div>
          )}

          {/* 하단 정보 */}
          <div className="text-center text-xs text-gray-500">
            <p>이용약관에 동의하고 Vlooo를 이용하고 있습니다.</p>
            <p className="mt-2">
              문의사항이 있으신가요?{' '}
              <Link href="/support/contact" className="text-blue-400 hover:text-blue-300">
                고객지원팀에 연락주세요
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
