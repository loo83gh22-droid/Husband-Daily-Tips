import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Best Husband Ever - Your Daily Action, Delivered',
    template: '%s | Best Husband Ever',
  },
  description: 'Daily actions to level up your marriage game. One move today. One wife smile tomorrow. You got this. Become the husband you and your partner deserve with consistent, meaningful actions.',
  keywords: ['best husband', 'marriage tips', 'relationship advice', 'husband daily actions', 'marriage improvement', 'relationship goals', 'daily relationship tips', 'husband guide', 'marriage help', 'relationship building'],
  authors: [{ name: 'Best Husband Ever' }],
  creator: 'Best Husband Ever',
  publisher: 'Best Husband Ever',
  metadataBase: new URL('https://www.besthusbandever.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.besthusbandever.com',
    siteName: 'Best Husband Ever',
    title: 'Best Husband Ever - Your Daily Action, Delivered',
    description: 'Daily actions to level up your marriage game. One move today. One wife smile tomorrow. You got this.',
    images: [
      {
        url: '/og-image.png', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'Best Husband Ever - Daily Actions for Better Relationships',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Husband Ever - Your Daily Action, Delivered',
    description: 'Daily actions to level up your marriage game. One move today. One wife smile tomorrow.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here once you get it
    // google: 'your-verification-code',
  },
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


