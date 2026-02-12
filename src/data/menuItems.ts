/**
 * Vlooo 한글 메뉴 항목 정의 (TypeScript)
 * JSON 설정 파일 대신 직접 사용할 수 있는 객체 형식
 */

import { NavigationMenu, MenuItem, MenuSection } from '@/types/menu';

// 헤더 네비게이션 메뉴
export const HEADER_MENU: MenuItem[] = [
  {
    id: 'home',
    label: '홈',
    path: '/',
  },
  {
    id: 'dashboard',
    label: '대시보드',
    path: '/dashboard',
  },
  {
    id: 'convert',
    label: '변환하기',
    path: '/convert',
    icon: 'upload',
  },
  {
    id: 'pricing',
    label: '가격',
    path: '/pricing',
  },
  {
    id: 'support',
    label: '지원',
    icon: 'help-circle',
    children: [
      {
        id: 'faq',
        label: '자주 묻는 질문',
        path: '/support/faq',
      },
      {
        id: 'tutorial',
        label: '튜토리얼',
        path: '/support/tutorial',
      },
      {
        id: 'contact',
        label: '문의하기',
        path: '/support/contact',
      },
    ],
  },
  {
    id: 'account',
    label: '계정',
    icon: 'user',
  },
];

/**
 * ⚠️ IMPORTANT: 아이콘 레일 메뉴 (모든 페이지에서 동일 - 절대 변경 금지!)
 * 
 * 사용처: src/components/SidebarNavigation.tsx (아이콘 레일)
 * 
 * 항상 표시: 홈, 대시보드
 */
export const PRIMARY_SIDEBAR_MENU: MenuItem[] = [
  {
    id: 'home',
    label: '홈',
    path: '/',
    icon: 'home',
  },
  {
    id: 'dashboard',
    label: '대시보드',
    path: '/dashboard',
    icon: 'grid',
  },
];

/**
 * 홈 페이지 메뉴 패널 (/ 페이지에서만 사용)
 * 
 * 사용처: src/components/AppLayout.tsx → SidebarNavigation
 */
export const HOME_MENU_PANEL: MenuItem[] = [
  {
    id: 'home',
    label: '홈',
    path: '/',
    icon: 'home',
  },
  {
    id: 'new-video',
    label: '새 동영상 만들기',
    path: '',  // 클릭 시 모달 열기
    icon: 'plus-square',
  },
];

/**
 * 대시보드 페이지 메뉴 패널 (/dashboard 페이지에서만 사용)
 * 
 * 사용처: src/components/AppLayout.tsx → SidebarNavigation
 */
export const DASHBOARD_MENU_PANEL: MenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    path: '/dashboard',
    icon: 'grid',
  },
];

// 대시보드 사이드바 메뉴
export const DASHBOARD_MENU: MenuSection[] = [
  {
    id: 'my-projects',
    title: '프로젝트 관리',
    items: [
      {
        id: 'all-projects',
        label: '모든 프로젝트',
        path: '/dashboard/projects',
        icon: 'file-list',
        description: '변환한 모든 영상 프로젝트 보기',
      },
      {
        id: 'create-new',
        label: '새 프로젝트',
        path: '/dashboard/projects/new',
        icon: 'plus',
        description: '새로운 PPT 업로드',
      },
      {
        id: 'recent',
        label: '최근 프로젝트',
        path: '/dashboard/projects/recent',
        icon: 'clock',
        badge: 'new',
      },
    ],
  },
  {
    id: 'analytics',
    title: '분석 & 통계',
    items: [
      {
        id: 'usage-stats',
        label: '사용 통계',
        path: '/dashboard/analytics',
        icon: 'bar-chart-2',
      },
      {
        id: 'credits',
        label: '크레딧 사용량',
        path: '/dashboard/analytics/credits',
        icon: 'coins',
      },
    ],
  },
  {
    id: 'settings',
    title: '설정',
    items: [
      {
        id: 'profile',
        label: '프로필 설정',
        path: '/dashboard/settings/profile',
        icon: 'user-circle',
      },
      {
        id: 'preferences',
        label: '기본 설정',
        path: '/dashboard/settings/preferences',
        icon: 'sliders',
      },
      {
        id: 'security',
        label: '보안',
        path: '/dashboard/settings/security',
        icon: 'shield',
      },
    ],
  },
];

// 변환 프로세스 스텝 메뉴
export const CONVERSION_STEPS: MenuItem[] = [
  {
    id: 'step-1',
    label: '1단계: PPT 업로드',
    path: '/convert/upload',
    icon: 'upload',
    description: 'PPT 파일을 선택하세요',
  },
  {
    id: 'step-2',
    label: '2단계: 스크립트 편집',
    path: '/convert/script',
    icon: 'edit-3',
    description: 'AI 생성 스크립트를 검토하고 수정하세요',
  },
  {
    id: 'step-3',
    label: '3단계: 음성 선택',
    path: '/convert/voice',
    icon: 'volume-2',
    description: '원하는 음성과 언어를 선택하세요',
  },
  {
    id: 'step-4',
    label: '4단계: 렌더링 설정',
    path: '/convert/settings',
    icon: 'sliders',
    description: '화질, 전환 효과 등을 설정하세요',
  },
  {
    id: 'step-5',
    label: '5단계: 미리보기',
    path: '/convert/preview',
    icon: 'eye',
    description: '최종 결과를 확인하세요',
  },
  {
    id: 'step-6',
    label: '6단계: 다운로드',
    path: '/convert/download',
    icon: 'download',
    description: '완성된 영상을 다운로드하세요',
    badge: '최종',
  },
];

// 계정 드롭다운 메뉴
export const ACCOUNT_MENU: MenuItem[] = [
  {
    id: 'my-account',
    label: '내 계정',
    path: '/account/profile',
    icon: 'user',
  },
  {
    id: 'subscription',
    label: '구독 플랜',
    path: '/account/subscription',
    icon: 'crown',
    badge: 'Premium',
  },
  {
    id: 'billing',
    label: '결제 방법',
    path: '/account/billing',
    icon: 'credit-card',
  },
  {
    id: 'purchase-history',
    label: '구매 내역',
    path: '/account/purchases',
    icon: 'history',
  },
  {
    id: 'logout',
    label: '로그아웃',
    path: '/logout',
    icon: 'log-out',
  },
];

// 푸터 메뉴
export const FOOTER_MENU: MenuItem[] = [
  {
    id: 'about',
    label: '회사 소개',
    path: '/about',
  },
  {
    id: 'blog',
    label: '블로그',
    path: '/blog',
  },
  {
    id: 'contact',
    label: '문의',
    path: '/contact',
  },
  {
    id: 'privacy',
    label: '개인정보 처리방침',
    path: '/privacy',
  },
  {
    id: 'terms',
    label: '이용약관',
    path: '/terms',
  },
  {
    id: 'social',
    label: '소셜 미디어',
    children: [
      {
        id: 'twitter',
        label: 'X (트위터)',
        path: 'https://twitter.com/vlooo',
        icon: 'twitter',
      },
      {
        id: 'youtube',
        label: '유튜브',
        path: 'https://youtube.com/@vlooo',
        icon: 'youtube',
      },
      {
        id: 'instagram',
        label: '인스타그램',
        path: 'https://instagram.com/vlooo',
        icon: 'instagram',
      },
    ],
  },
];

// 전체 메뉴 구성
export const MENU_CONFIG: NavigationMenu = {
  header: HEADER_MENU,
  dashboard: DASHBOARD_MENU,
  conversion: CONVERSION_STEPS,
  account: ACCOUNT_MENU,
  footer: FOOTER_MENU,
};

// 음성 선택 메뉴 (변환 3단계용)
export const VOICE_OPTIONS = [
  {
    id: 'professional-male',
    label: '전문가 (남성)',
    description: '신뢰감 있는 IT 전문가 톤',
    language: '한국어',
  },
  {
    id: 'professional-female',
    label: '전문가 (여성)',
    description: '명확하고 전문적인 톤',
    language: '한국어',
  },
  {
    id: 'friendly-male',
    label: '친근함 (남성)',
    description: '따뜻하고 친근한 톤',
    language: '한국어',
  },
  {
    id: 'friendly-female',
    label: '친근함 (여성)',
    description: '부드럽고 친근한 톤',
    language: '한국어',
  },
];

// 렌더링 설정 메뉴 (변환 4단계용)
export const RENDER_SETTINGS = [
  {
    id: 'quality',
    label: '화질',
    options: [
      { id: '720p', label: '720p (기본)', value: '720p' },
      { id: '1080p', label: '1080p (HD)', value: '1080p' },
      { id: '2160p', label: '2160p (4K)', value: '2160p' },
    ],
  },
  {
    id: 'transition',
    label: '슬라이드 전환 효과',
    options: [
      { id: 'fade', label: '페이드', value: 'fade' },
      { id: 'slide', label: '슬라이드', value: 'slide' },
      { id: 'zoom', label: '줌', value: 'zoom' },
      { id: 'none', label: '없음', value: 'none' },
    ],
  },
  {
    id: 'speed',
    label: '재생 속도',
    options: [
      { id: '0.75x', label: '0.75배', value: 0.75 },
      { id: '1x', label: '1배 (기본)', value: 1 },
      { id: '1.25x', label: '1.25배', value: 1.25 },
      { id: '1.5x', label: '1.5배', value: 1.5 },
    ],
  },
];

// 구독 플랜 메뉴
export const PRICING_PLANS = [
  {
    id: 'free',
    label: '무료',
    description: '시작하기에 좋은 플랜',
    price: '₩0',
    features: [
      '슬라이드 5장 제한',
      '720p 화질',
      '워터마크 포함',
      '기본 음성 1개',
    ],
  },
  {
    id: 'pro',
    label: '프로',
    description: '가장 인기 있는 플랜',
    price: '₩9,900/월',
    badge: '인기',
    features: [
      '무제한 슬라이드',
      '1080p HD 화질',
      '워터마크 없음',
      '프리미엄 음성 5개',
      '우선 지원',
    ],
  },
  {
    id: 'enterprise',
    label: '엔터프라이즈',
    description: '조직용 맞춤 솔루션',
    price: '문의',
    features: [
      '모든 Pro 기능',
      '4K 화질',
      '커스텀 AI 보이스',
      'API 접근',
      '전담 지원',
    ],
  },
];
