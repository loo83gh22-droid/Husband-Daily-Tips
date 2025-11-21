'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import UserProvider with no SSR to prevent hydration issues
const UserProvider = dynamic(
  () => import('@auth0/nextjs-auth0/client').then((mod) => mod.UserProvider),
  { 
    ssr: false,
  }
);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div suppressHydrationWarning style={{ minHeight: '100vh' }}>
        {children}
      </div>
    );
  }

  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}

