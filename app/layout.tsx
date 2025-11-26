import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Best Husband Ever - Your Daily Action, Delivered',
  description: 'Daily actions to level up your marriage game. One move today. One wife smile tomorrow. You got this.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress React hydration warnings and CORS/logout errors
              const originalError = console.error;
              console.error = function(...args) {
                const errorMsg = typeof args[0] === 'string' ? args[0] : '';
                if (
                  errorMsg.includes('Hydration') ||
                  errorMsg.includes('hydration') ||
                  errorMsg.includes('Text content does not match') ||
                  errorMsg.includes('Failed to fetch RSC payload') ||
                  errorMsg.includes('CORS policy') ||
                  errorMsg.includes('api/auth/logout') ||
                  errorMsg.includes('auth/logout')
                ) {
                  return;
                }
                originalError.apply(console, args);
              };
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


