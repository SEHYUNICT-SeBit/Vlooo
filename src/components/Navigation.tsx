/**
 * Navigation.tsx
 * Vlooo 메인 네비게이션 컴포넌트
 * Next.js + React + TypeScript로 작성
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HEADER_MENU, ACCOUNT_MENU } from '@/data/menuItems';
import { MenuItem } from '@/types/menu';

interface NavigationProps {
  isLoggedIn?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ isLoggedIn = false }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const handleMouseEnter = (itemId: string) => {
    setActiveDropdown(itemId);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const isDropdownOpen = activeDropdown === item.id;

    if (item.id === 'account' && isLoggedIn) {
      return (
        <div
          key={index}
          className="relative"
          onMouseEnter={() => setAccountDropdownOpen(true)}
          onMouseLeave={() => setAccountDropdownOpen(false)}
        >
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors">
            {item.icon && <span className="text-lg">{item.icon}</span>}
            {item.label}
          </button>

          {accountDropdownOpen && (
            <div className="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              {ACCOUNT_MENU.map((menuItem, idx) => (
                <Link
                  key={idx}
                  href={menuItem.path || '#'}
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span>{menuItem.label}</span>
                    {menuItem.badge && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {menuItem.badge}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (item.id === 'account' && !isLoggedIn) {
      return (
        <Link
          key={index}
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          로그인
        </Link>
      );
    }

    return (
      <div
        key={index}
        className="relative"
        onMouseEnter={() => handleMouseEnter(item.id)}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href={item.path || '#'}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          {item.icon && <span className="text-lg">{item.icon}</span>}
          {item.label}
        </Link>

        {hasChildren && isDropdownOpen && (
          <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {item.children!.map((child, idx) => (
              <Link
                key={idx}
                href={child.path || '#'}
                className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100 last:border-b-0"
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-blue-600">
            <span>🎬</span>
            <span>Vlooo</span>
          </Link>

          {/* 메뉴 항목들 */}
          <div className="flex items-center gap-1">
            {HEADER_MENU.map((item, index) => renderMenuItem(item, index))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
