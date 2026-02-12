'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // 로그인 기능이 비활성화되었으므로, 간단히 홈으로 리다이렉트
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      로그아웃 중...
    </div>
  );
}
