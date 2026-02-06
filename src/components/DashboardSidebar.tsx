/**
 * DashboardSidebar.tsx
 * Vlooo 대시보드 사이드바 메뉴 컴포넌트
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DASHBOARD_MENU } from '@/data/menuItems';
import { MenuSection } from '@/types/menu';

interface DashboardSidebarProps {
  activeId?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeId }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const renderMenuSection = (section: MenuSection, index: number) => {
    const isExpanded = expandedSections.includes(section.id);

    return (
      <div key={index} className="mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-3">
          {section.title}
        </h3>

        <div className="space-y-1">
          {section.items.map((item, itemIdx) => (
            <Link
              key={itemIdx}
              href={item.path || '#'}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                activeId === item.id
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <div>
                  <div>{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                  )}
                </div>
              </div>
              {item.badge && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-8">네비게이션</h2>

        {DASHBOARD_MENU.map((section, index) => renderMenuSection(section, index))}

        {/* 맨 아래 업그레이드 제안 */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Premium으로 업그레이드</h4>
          <p className="text-xs text-gray-600 mb-3">4K 화질과 무제한 변환을 이용하세요</p>
          <Link
            href="/pricing"
            className="inline-block w-full text-center py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            요금 확인
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
