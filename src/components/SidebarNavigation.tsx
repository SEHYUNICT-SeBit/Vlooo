'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_SIDEBAR_MENU } from '@/data/menuItems';
import type { MenuItem } from '@/types/menu';

interface SidebarNavigationProps {
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  iconMenu?: MenuItem[];  // 아이콘 레일용
  panelMenu?: MenuItem[];  // 메뉴 패널용
  onNewVideoClick?: () => void;
}

const IconMap: { [key: string]: React.FC<{ className?: string }> } = {
  home: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  ),
  'plus-square': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  grid: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  ),
  clock: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  lightbulb: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

export const SidebarNavigation = ({
  isCollapsed = true,
  onToggleCollapsed,
  iconMenu = PRIMARY_SIDEBAR_MENU,
  panelMenu = PRIMARY_SIDEBAR_MENU,
  onNewVideoClick,
}: SidebarNavigationProps) => {
  const pathname = usePathname();
  const isCompact = isCollapsed;

  const navContent = (
    <div className={`flex h-full bg-white ${isCompact ? 'w-16' : 'w-80'}`}>
      <div className="flex w-16 flex-col items-start border-r border-[color:var(--line)] py-4">
        <div className="flex flex-col items-center gap-2 w-full px-2">
          {(iconMenu as MenuItem[]).map((item) => {
            const isActive = item.path && pathname === item.path;
            const Icon = item.icon && IconMap[item.icon];
            
            // "새 동영상 만들기" 버튼은 클릭 시 모달 열기
            if (item.id === 'new-video') {
              return (
                <button
                  key={item.id}
                  onClick={onNewVideoClick}
                  title={item.label}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border transition flex-shrink-0 border-transparent text-gray-500 hover:border-[color:var(--line)] hover:text-[color:var(--accent)]"
                >
                  {Icon && <Icon className="h-5 w-5" />}
                </button>
              );
            }
            
            // 나머지 메뉴는 링크로 이동
            return (
              <Link
                key={item.id}
                href={item.path || '#'}
                title={item.label}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition flex-shrink-0 ${
                  isActive
                    ? 'border-[color:var(--accent)] text-[color:var(--accent)] bg-[color:var(--surface)]'
                    : 'border-transparent text-gray-500 hover:border-[color:var(--line)] hover:text-[color:var(--accent)]'
                }`}
              >
                {Icon && <Icon className="h-5 w-5" />}
              </Link>
            );
          })}
        </div>
      </div>

      {!isCompact && (
        <div className="flex min-w-0 flex-1 flex-col">
          <nav className="flex-1 px-6 py-5">
            <div className="space-y-1">
              {(panelMenu as MenuItem[]).map((item) => {
                const isActive = item.path && pathname === item.path;
                const Icon = item.icon && IconMap[item.icon];
                
                // "새 동영상 만들기" 버튼은 클릭 시 모달 열기
                if (item.id === 'new-video') {
                  return (
                    <button
                      key={item.id}
                      onClick={onNewVideoClick}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition text-gray-700 hover:bg-[color:var(--surface)] hover:text-[color:var(--accent)]"
                    >
                      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                      <span className="min-w-0">{item.label}</span>
                    </button>
                  );
                }
                
                // 나머지 메뉴는 링크로 이동
                return (
                  <Link
                    key={item.id}
                    href={item.path || '#'}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[color:var(--surface)] text-[color:var(--accent)]'
                        : 'text-gray-700 hover:bg-[color:var(--surface)] hover:text-[color:var(--accent)]'
                    }`}
                  >
                    {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                    <span className="min-w-0">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );

  return (
    <aside className="fixed lg:left-0 lg:top-14 lg:flex lg:h-[calc(100vh-3.5rem)] lg:border-r lg:border-[color:var(--line)]">
      {navContent}
    </aside>
  );
};

export default SidebarNavigation;
