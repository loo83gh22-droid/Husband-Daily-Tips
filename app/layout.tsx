import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Best Husband Ever - Level Up Your Marriage Game',
  description: 'Daily tips, actions, and guidance to help you become the best husband ever',
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
              // Suppress React hydration warnings and CORS errors for logout
              const originalError = console.error;
              console.error = function(...args) {
                if (
                  typeof args[0] === 'string' &&
                  (args[0].includes('Hydration') ||
                   args[0].includes('hydration') ||
                   args[0].includes('Text content does not match') ||
                   args[0].includes('Failed to fetch RSC payload') ||
                   args[0].includes('CORS policy'))
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}


