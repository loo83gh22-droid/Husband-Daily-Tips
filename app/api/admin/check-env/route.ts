import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

/**
 * Admin endpoint to verify critical environment variables are set
 * Does NOT expose actual values for security
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();

    // Only allow authenticated users (you can restrict this further to admin users)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requiredEnvVars = {
      // Auth0
      AUTH0_SECRET: !!process.env.AUTH0_SECRET,
      AUTH0_BASE_URL: !!process.env.AUTH0_BASE_URL,
      AUTH0_ISSUER_BASE_URL: !!process.env.AUTH0_ISSUER_BASE_URL,
      AUTH0_CLIENT_ID: !!process.env.AUTH0_CLIENT_ID,
      AUTH0_CLIENT_SECRET: !!process.env.AUTH0_CLIENT_SECRET,
      
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      
      // Stripe
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      
      // Email
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      RESEND_FROM_EMAIL: !!process.env.RESEND_FROM_EMAIL,
      
      // Optional but recommended
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    };

    const allSet = Object.values(requiredEnvVars).every(Boolean);
    const missing = Object.entries(requiredEnvVars)
      .filter(([_, isSet]) => !isSet)
      .map(([key]) => key);

    // Get environment info (without exposing values)
    const envInfo = {
      nodeEnv: process.env.NODE_ENV || 'not set',
      baseUrl: process.env.AUTH0_BASE_URL ? 'set' : 'missing',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
    };

    return NextResponse.json({
      status: allSet ? 'ok' : 'missing_variables',
      allSet,
      missing,
      required: Object.keys(requiredEnvVars),
      environment: envInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking environment variables:', error);
    return NextResponse.json(
      { error: 'Failed to check environment variables' },
      { status: 500 }
    );
  }
}

