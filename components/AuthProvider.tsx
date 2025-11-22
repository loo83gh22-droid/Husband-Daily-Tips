'use client';

import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always wrap in UserProvider - it handles SSR and client-side rendering
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}

