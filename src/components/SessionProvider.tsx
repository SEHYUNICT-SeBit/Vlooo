'use client';

import type { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // NextAuth 기능이 비활성화된 상태
  return <>{children}</>;
};

export default AuthProvider;
