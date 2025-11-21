'use client';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render UserProvider after mount to avoid hydration issues
  if (!mounted) {
    return <>{children}</>;
  }

  return <UserProvider>{children}</UserProvider>;
}

