'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import UserProvider with no SSR to prevent hydration issues
const UserProvider = dynamic(
  () => import('@auth0/nextjs-auth0/client').then((mod) => mod.UserProvider),
  { 
    ssr: false,
    loading: () => <div suppressHydrationWarning>{null}</div>
  }
);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div suppressHydrationWarning style={{ display: 'contents' }}>{children}</div>;
  }

  return (
    <div suppressHydrationWarning>
      <UserProvider>{children}</UserProvider>
    </div>
  );
}

