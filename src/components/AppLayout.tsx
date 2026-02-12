'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';
import { Navigation } from '@/components/Navigation';
import { SidebarNavigation } from '@/components/SidebarNavigation';
import { LoginModal } from '@/components/LoginModal';
import { FileUploadModal } from '@/components/FileUploadModal';
import { PRIMARY_SIDEBAR_MENU, HOME_MENU_PANEL, DASHBOARD_MENU_PANEL } from '@/data/menuItems';
import { useConversionStore } from '@/context/ConversionStore';
import { useConversion } from '@/hooks/useConversion';
import { useFileUploadModal } from '@/context/FileUploadModalContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const { resetConversion, currentStep } = useConversionStore();
  const { isOpen: isFileUploadModalOpen, openModal, closeModal } = useFileUploadModal();

  // 변환 훅 실행
  useConversion(uploadFile);

  // 현재 페이지에 따라 메뉴 패널 선택
  const getPanelMenu = () => {
    if (pathname === '/dashboard') return DASHBOARD_MENU_PANEL;
    return HOME_MENU_PANEL;  // 기본값: 홈 페이지
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <>
      <Navigation
        isLoggedIn={false}
        showSidebarToggle={true}
        onToggleSidebar={handleSidebarToggle}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />
      {/* ⚠️ IMPORTANT: 아이콘 레일(PRIMARY) + 메뉴 패널(동적) */}
      <SidebarNavigation
        isCollapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
        iconMenu={PRIMARY_SIDEBAR_MENU}
        panelMenu={getPanelMenu()}
        onNewVideoClick={openModal}
      />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <FileUploadModal
        isOpen={isFileUploadModalOpen}
        onClose={closeModal}
        onFileSelect={(file) => {
          console.log('[AppLayout] File selected:', file.name);
          // 새 변환 시작 전 이전 상태 완전 초기화
          if (currentStep !== 'upload') {
            resetConversion();
          }
          // 파일 설정 → useConversion 훅이 자동으로 변환 시작
          setUploadFile(file);
          closeModal();
        }}
      />
      <main
        style={{
          '--sidebar-width': sidebarCollapsed ? '4rem' : '24rem',
        } as CSSProperties}
        className="lg:pl-[var(--sidebar-width)]"
      >
        {children}
      </main>
    </>
  );
};

export default AppLayout;
