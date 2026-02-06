/**
 * useMenu.ts
 * Vlooo 메뉴 관리 커스텀 훅
 */

import { useState, useCallback } from 'react';
import { MenuItem, MenuSection } from '@/types/menu';

export interface UseMenuReturn {
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  findMenuItemById: (id: string, items: MenuItem[]) => MenuItem | undefined;
  findMenuSectionById: (id: string, sections: MenuSection[]) => MenuSection | undefined;
  getMenuBreadcrumb: (itemId: string, items: MenuItem[]) => MenuItem[];
}

/**
 * 메뉴 상태 관리 훅
 * @example
 * const { activeMenuId, setActiveMenuId } = useMenu();
 */
export const useMenu = (): UseMenuReturn => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /**
   * ID로 메뉴 항목 찾기
   */
  const findMenuItemById = useCallback(
    (id: string, items: MenuItem[]): MenuItem | undefined => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findMenuItemById(id, item.children);
          if (found) return found;
        }
      }
      return undefined;
    },
    []
  );

  /**
   * ID로 메뉴 섹션 찾기
   */
  const findMenuSectionById = useCallback(
    (id: string, sections: MenuSection[]): MenuSection | undefined => {
      return sections.find((section) => section.id === id);
    },
    []
  );

  /**
   * 메뉴 경로 생성 (브레드크럼 네비게이션용)
   */
  const getMenuBreadcrumb = useCallback(
    (itemId: string, items: MenuItem[]): MenuItem[] => {
      const breadcrumb: MenuItem[] = [];

      const traverse = (items: MenuItem[]): boolean => {
        for (const item of items) {
          if (item.id === itemId) {
            breadcrumb.push(item);
            return true;
          }
          if (item.children) {
            if (traverse(item.children)) {
              breadcrumb.unshift(item);
              return true;
            }
          }
        }
        return false;
      };

      traverse(items);
      return breadcrumb;
    },
    []
  );

  return {
    activeMenuId,
    setActiveMenuId,
    isDropdownOpen,
    setIsDropdownOpen,
    findMenuItemById,
    findMenuSectionById,
    getMenuBreadcrumb,
  };
};

/**
 * 메뉴 항목 필터링 훅
 */
export const useMenuFilter = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filterMenuItems = useCallback(
    (items: MenuItem[]): MenuItem[] => {
      if (!searchTerm) return items;

      return items
        .filter(
          (item) =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((item) => ({
          ...item,
          children: item.children ? filterMenuItems(item.children) : undefined,
        }));
    },
    [searchTerm]
  );

  return {
    searchTerm,
    setSearchTerm,
    filterMenuItems,
  };
};

export default useMenu;
