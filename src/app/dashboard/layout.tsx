import { Fragment } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // AppLayout이 이미 Navigation과 SidebarNavigation을 처리함
  return <Fragment>{children}</Fragment>;
}
