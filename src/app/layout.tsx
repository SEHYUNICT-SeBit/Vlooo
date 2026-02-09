import type { Metadata } from 'next';
import '@/globals.css';
import { AuthProvider } from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'Vlooo - PPT를 전문가 영상으로',
  description: '내 PPT가 전문가의 영상으로 흐르다',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
