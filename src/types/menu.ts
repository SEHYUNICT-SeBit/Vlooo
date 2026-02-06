/**
 * Vlooo 메뉴 시스템 타입 정의
 */

export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  badge?: string | number;
  children?: MenuItem[];
  description?: string;
  action?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface NavigationMenu {
  header: MenuItem[];
  dashboard: MenuSection[];
  conversion: MenuItem[];
  account: MenuItem[];
  footer: MenuItem[];
}

export interface MenuConfig {
  brand: {
    name: string;
    slogan: string;
  };
  navigation: NavigationMenu;
}
