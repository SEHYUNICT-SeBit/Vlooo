# 메뉴 구조 가이드

## 왼쪽 사이드바 메뉴 (고정)

### 메뉴 정의
- **메뉴 이름**: `PRIMARY_SIDEBAR_MENU`
- **위치**: `src/data/menuItems.ts` (라인 63-85)
- **사용처**: `src/components/AppLayout.tsx` (라인 31-36)

### 현재 메뉴 항목
```typescript
PRIMARY_SIDEBAR_MENU = [
  { id: 'home', label: '홈', path: '/', icon: 'home' },
  { id: 'dashboard', label: '대시보드', path: '/dashboard', icon: 'folder' },
]
```

### 중요 규칙

⚠️ **이 메뉴는 절대 변경하지 마세요!**

1. **모든 페이지에서 동일하게 표시됩니다**
   - 홈 페이지
   - 대시보드
   - 로그인 페이지
   - 모든 다른 페이지

2. **페이지별로 메뉴를 변경하면 안 됩니다**
   ```tsx
   // ❌ 잘못된 예
   menu={HOME_SIDEBAR_MENU}
   menu={DASHBOARD_SIDEBAR_MENU}
   
   // ✅ 올바른 예
   menu={PRIMARY_SIDEBAR_MENU}  // AppLayout에서만 사용
   ```

3. **페이지별 메뉴가 필요하면 상의하세요**
   - 요구사항이 생기면 전체 아키텍처를 검토한 후 변경합니다

## 메뉴 변경 방법

### 메뉴 항목 추가/제거

1. `src/data/menuItems.ts`에서 `PRIMARY_SIDEBAR_MENU` 수정
   ```typescript
   export const PRIMARY_SIDEBAR_MENU: MenuItem[] = [
     { id: 'home', label: '홈', path: '/', icon: 'home' },
     { id: 'dashboard', label: '대시보드', path: '/dashboard', icon: 'folder' },
     // { id: 'new-item', label: '새 항목', path: '/new', icon: 'icon' },  // ← 추가
   ];
   ```

2. 변경사항은 자동으로 모든 페이지에 반영됩니다

## 아키텍처

```
layout.tsx (서버)
└─ AppLayout (클라이언트)
   ├─ Navigation
   ├─ SidebarNavigation  ← PRIMARY_SIDEBAR_MENU 사용
   ├─ LoginModal
   └─ {children}  ← 모든 페이지의 콘텐츠
```

## FAQ

**Q: 특정 페이지에서만 다른 메뉴를 보이고 싶어요**
A: 현재 설계상 모든 페이지에서 동일한 메뉴를 표시합니다. 필요하면 요청해주세요.

**Q: 메뉴 아이콘은 어디서 정의하나요?**
A: `src/components/SidebarNavigation.tsx`에서 아이콘 매핑을 확인하세요.

**Q: 메뉴 스타일을 변경하고 싶어요**
A: `src/components/SidebarNavigation.tsx`의 CSS 클래스를 수정하면 됩니다.
