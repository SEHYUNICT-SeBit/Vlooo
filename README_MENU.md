# Vlooo 한글 메뉴 시스템

> PPT를 전문가급 발표 영상으로 변환하는 AI 서비스 - 한글화된 메뉴 구조

## 📁 디렉토리 구조

```
src/
├── config/
│   └── menu.json              # 메뉴 구조 JSON 설정
├── types/
│   └── menu.ts                # 메뉴 TypeScript 타입 정의
├── data/
│   └── menuItems.ts           # 한글 메뉴 항목 (TypeScript 객체)
├── hooks/
│   └── useMenu.ts             # 메뉴 관리 커스텀 훅
└── components/
    ├── Navigation.tsx         # 헤더 네비게이션 컴포넌트
    ├── DashboardSidebar.tsx   # 대시보드 사이드바
    ├── ConversionSteps.tsx    # 변환 프로세스 단계 표시
    └── Footer.tsx             # 푸터 메뉴
```

## 🎯 주요 기능

### 1. 헤더 네비게이션 (`Navigation.tsx`)
- 🏠 **홈**: 메인 페이지
- 📊 **대시보드**: 사용자 프로젝트 관리
- 🎬 **변환하기**: PPT 변환 시작
- 💰 **가격**: 요금제 정보
- ❓ **지원**: FAQ, 튜토리얼, 문의
- 👤 **계정**: 로그인/프로필 메뉴

### 2. 대시보드 사이드바 (`DashboardSidebar.tsx`)
```
프로젝트 관리
├── 모든 프로젝트
├── 새 프로젝트
└── 최근 프로젝트

분석 & 통계
├── 사용 통계
└── 크레딧 사용량

설정
├── 프로필 설정
├── 기본 설정
└── 보안
```

### 3. 변환 프로세스 (`ConversionSteps.tsx`)
6단계로 구성된 PPT → 영상 변환 흐름:
1. **PPT 업로드** - 파일 선택
2. **스크립트 편집** - AI 생성 스크립트 검토
3. **음성 선택** - 음성과 언어 선택
4. **렌더링 설정** - 화질, 효과, 속도 설정
5. **미리보기** - 최종 확인
6. **다운로드** - 완성된 영상 다운로드

### 4. 푸터 메뉴 (`Footer.tsx`)
- 회사 소개, 블로그, 문의
- 개인정보 처리방침, 이용약관
- 소셜 미디어 링크 (X, YouTube, Instagram)

## 📝 메뉴 항목 정의

### JSON 설정 (config/menu.json)
```json
{
  "brand": {
    "name": "Vlooo",
    "slogan": "내 PPT가 전문가의 영상으로 흐르다"
  },
  "navigation": {
    "header": [...],
    "dashboard": [...],
    "conversion": [...],
    "account": [...],
    "footer": [...]
  }
}
```

### TypeScript 객체 (data/menuItems.ts)
```typescript
export const HEADER_MENU: MenuItem[] = [
  {
    id: 'home',
    label: '홈',
    path: '/',
  },
  // ...
];
```

## 🔧 사용 방법

### 1. Navigation 컴포넌트 사용
```tsx
import { Navigation } from '@/components/Navigation';

export default function Layout() {
  return (
    <>
      <Navigation isLoggedIn={true} />
      {/* 페이지 컨텐츠 */}
    </>
  );
}
```

### 2. DashboardSidebar 컴포넌트 사용
```tsx
import { DashboardSidebar } from '@/components/DashboardSidebar';

export default function Dashboard() {
  return (
    <div className="flex">
      <DashboardSidebar activeId="all-projects" />
      <main>{/* 메인 컨텐츠 */}</main>
    </div>
  );
}
```

### 3. ConversionSteps 컴포넌트 사용
```tsx
import { ConversionSteps } from '@/components/ConversionSteps';

export default function ConvertPage() {
  return (
    <>
      <ConversionSteps currentStep={2} />
      {/* 변환 페이지 컨텐츠 */}
    </>
  );
}
```

### 4. useMenu 훅 사용
```tsx
import { useMenu } from '@/hooks/useMenu';
import { HEADER_MENU } from '@/data/menuItems';

export default function MyComponent() {
  const { activeMenuId, setActiveMenuId, findMenuItemById } = useMenu();
  
  const homeItem = findMenuItemById('home', HEADER_MENU);
  
  return <div>{homeItem?.label}</div>;
}
```

## 📋 메뉴 데이터 구조

### MenuItem 타입
```typescript
interface MenuItem {
  id: string;               // 고유 식별자
  label: string;            // 한글 메뉴명
  path?: string;            // 링크 경로
  icon?: string;            // 아이콘
  badge?: string | number;  // 배지 (new, Premium 등)
  children?: MenuItem[];    // 하위 메뉴
  description?: string;     // 설명 텍스트
  action?: string;          // 액션 타입
}
```

### MenuSection 타입 (대시보드용)
```typescript
interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}
```

## 🎨 스타일링

모든 컴포넌트는 **Tailwind CSS**로 스타일됨:
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 다크 모드 지원 가능
- 호버 효과 및 전환 애니메이션
- 액세시빌리티 고려

## 🔄 추가 메뉴 항목

새로운 메뉴를 추가하려면:

1. **`src/data/menuItems.ts`에 항목 추가:**
```typescript
export const MY_NEW_MENU: MenuItem[] = [
  {
    id: 'new-item',
    label: '새 메뉴',
    path: '/new-path',
    icon: '📌',
  },
];
```

2. **`src/types/menu.ts`에 타입 추가** (필요시)

3. **`src/config/menu.json`에 JSON 추가** (필요시)

4. **컴포넌트에서 사용:**
```tsx
import { MY_NEW_MENU } from '@/data/menuItems';
```

## 📞 음성 옵션 (변환 3단계)

```typescript
export const VOICE_OPTIONS = [
  {
    id: 'professional-male',
    label: '전문가 (남성)',
    description: '신뢰감 있는 IT 전문가 톤',
  },
  // ...
];
```

## ⚙️ 렌더링 설정 (변환 4단계)

```typescript
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
  // ...
];
```

## 💳 구독 요금제

```typescript
export const PRICING_PLANS = [
  {
    id: 'free',
    label: '무료',
    price: '₩0',
    features: ['슬라이드 5장 제한', '720p 화질', ...],
  },
  // ...
];
```

## 🚀 시작하기

1. 모든 파일이 `src/` 디렉토리 안에 위치
2. Next.js 프로젝트에서 path alias 설정 확인: `@/` = `src/`
3. 컴포넌트 import 및 사용
4. Tailwind CSS 설치 필수

## 📌 주요 특징

✅ **완전 한글화** - 모든 메뉴가 한글로 구성  
✅ **타입 안정성** - TypeScript로 완벽한 타입 정의  
✅ **하이브리드** - JSON + TypeScript 객체 지원  
✅ **재사용 가능** - 컴포넌트와 훅으로 쉬운 재활용  
✅ **확장성** - 새로운 메뉴 항목 쉽게 추가 가능  
✅ **반응형** - 모든 디바이스에 최적화  
✅ **접근성** - 시맨틱 HTML 및 ARIA 속성 고려  

## 🎯 다음 단계

- [ ] 실제 API 라우트 연결
- [ ] 사용자 인증 통합
- [ ] 다국어 지원 (i18n)
- [ ] 다크 모드 구현
- [ ] 메뉴 권한 관리 시스템
- [ ] 분석 (GTM, 클릭 추적)

---

**Last Updated**: February 5, 2026  
**Status**: 🟢 Production Ready
