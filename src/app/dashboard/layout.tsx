'use client';

import { Navigation } from '@/components/Navigation';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Footer } from '@/components/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation isLoggedIn={true} />
      <div className="flex flex-1">
        <DashboardSidebar activeId="all-projects" />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
