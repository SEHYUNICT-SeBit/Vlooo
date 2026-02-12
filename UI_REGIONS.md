# UI 영역 명명 및 구조

## 전체 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                      [상단 내비게이션 바]                          │
│  LOGO | Vlooo | [메뉴 토글] ──────────── [로그인 버튼]           │
└─────────────────────────────────────────────────────────────────┘
┌──────┬─────────────────────────────────────────────────────────┐
│ 아이 │                                                         │
│ 콘   │                                                         │
│ 레   │              [메인 콘텐츠 영역]                          │
│ 일   │         (홈/대시보드/로그인 페이지)                      │
│ (고  │                                                         │
│ 정) │                                                         │
│ 4rem │                                                         │
│      │                                                         │
└──────┴─────────────────────────────────────────────────────────┘
```

## UI 영역 명칭 정의

### 1. [상단 내비게이션 바] = `TopNavigation` / `Header`
- **컴포넌트**: `Navigation.tsx`
- **역할**: 로고, 브랜드명, 토글 버튼, 로그인 버튼
- **높이**: 56px (h-14)
- **위치**: `sticky top-0 z-40`

### 2. [아이콘 레일] = `IconRail` / `SidebarIconRail`
- **컴포넌트**: `SidebarNavigation.tsx` 내부
- **역할**: 왼쪽 끝 고정 영역, 아이콘만 표시
- **너비**: 64px (w-16)
- **위치**: `fixed left-0 h-screen`

### 3. [메뉴 패널] = `MenuPanel` / `SidebarMenu`
- **컴포넌트**: `SidebarNavigation.tsx` 내부
- **역할**: 아이콘 레일 옆에 나타나는 메뉴 (홈, 대시보드)
- **너비**: 288px (w-72, 확장 시) / 0px (축소 시)
- **위치**: `fixed left-16`

### 4. [메뉴 토글 버튼] = `SidebarToggle` / `MenuToggleButton`
- **위치**: 상단 내비게이션 바의 메뉴 버튼
- **역할**: 메뉴 패널 열기/닫기
- **아이콘**: ≡ (햄버거 메뉴)

### 5. [메인 콘텐츠 영역] = `MainContent` / `PageContent`
- **위치**: main 태그
- **역할**: 페이지별 콘텐츠 표시
- **패딩**: 동적 (`--sidebar-width` CSS 변수)
  - 메뉴 열림: `pl-[288px]` (w-72)
  - 메뉴 닫힘: `pl-[64px]` (w-16)

### 6. [로그인 모달] = `LoginModal`
- **컴포넌트**: `LoginModal.tsx`
- **역할**: 소셜 로그인 및 이메일 로그인
- **위치**: `fixed inset-0 z-50`
- **백그라운드**: `bg-black/50`

## 우리가 사용할 공통 용어

### 작업 지시할 때:
- "**상단 내비게이션**" = 로고 있는 윗부분
- "**메뉴 토글 버튼**" = 상단 내비게이션의 햄버거 메뉴 버튼
- "**왼쪽 사이드바**" = 아이콘 레일 + 메뉴 패널 전체
- "**아이콘 레일**" = 왼쪽 끝 고정 64px 영역
- "**메뉴 패널**" = 아이콘 레일 옆의 메뉴 (열고 닫혀짐)
- "**메인 콘텐츠**" = 가운데 페이지 내용
- "**로그인 모달**" = 팝업 로그인 창

### 예시:
- ❌ "왼쪽에 있는 것 수정해"
- ✅ "메뉴 패널의 배경색 변경해"

- ❌ "위에 버튼 스타일 바꿔"
- ✅ "상단 내비게이션의 로그인 버튼 색상 변경해"

## 컴포넌트 → UI 영역 매핑

| UI 영역 | 컴포넌트 | 파일 | CSS 클래스 |
|--------|---------|------|-----------|
| 상단 내비게이션 | Navigation | `Navigation.tsx` | `sticky top-0 z-40 h-14` |
| 아이콘 레일 | SidebarNavigation | `SidebarNavigation.tsx` | `fixed left-0 w-16 h-screen` |
| 메뉴 패널 | SidebarNavigation | `SidebarNavigation.tsx` | `fixed left-16 w-72 h-screen` |
| 메인 콘텐츠 | main | `AppLayout.tsx` | `lg:pl-[var(--sidebar-width)]` |
| 로그인 모달 | LoginModal | `LoginModal.tsx` | `fixed inset-0 z-50` |

## 상태 관리 (AppLayout.tsx)

```typescript
// 토글 상태
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
// ↑ false = 메뉴 패널 보임 (확장)
// ↑ true = 메뉴 패널 숨김 (축소)

// 로그인 모달 상태
const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
// ↑ true = 로그인 모달 표시
// ↑ false = 로그인 모달 숨김
```

## 빠른 참조

**메뉴 동작:**
- "메뉴 토글" = 메뉴 패널 열기/닫기
- "메뉴 펼치기" = sidebarCollapsed = false (메뉴 패널 표시)
- "메뉴 접기" = sidebarCollapsed = true (메뉴 패널 숨김)

**모달 동작:**
- "로그인 모달 열기" = isLoginModalOpen = true
- "모달 닫기" = isLoginModalOpen = false
