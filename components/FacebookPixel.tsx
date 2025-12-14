'use client';

import Script from 'next/script';
import { useEffect } from 'react';

interface FacebookPixelProps {
  pixelId?: string;
}

export default function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pixel = pixelId || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  useEffect(() => {
    if (!pixel || typeof window === 'undefined') return;

    // Track page view on mount and navigation
    const trackPageView = () => {
      if (window.fbq) {
        window.fbq('track', 'PageView');
      }
    };

    // Track initial page view
    trackPageView();

    // Track on navigation (for client-side routing)
    const handlePopState = () => {
      trackPageView();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pixel]);

  if (!pixel) {
    return null;
  }

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixel}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    fbq?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}

