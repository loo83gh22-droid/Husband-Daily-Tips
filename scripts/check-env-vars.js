/**
 * Script to check if all required environment variables are set
 * 
 * Usage: 
 *   Local: node scripts/check-env-vars.js
 *   Production: Call /api/admin/check-env endpoint
 */

require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = {
  // Auth0
  AUTH0_SECRET: 'Auth0 session secret',
  AUTH0_BASE_URL: 'Auth0 base URL (e.g., https://yourdomain.com)',
  AUTH0_ISSUER_BASE_URL: 'Auth0 issuer base URL',
  AUTH0_CLIENT_ID: 'Auth0 client ID',
  AUTH0_CLIENT_SECRET: 'Auth0 client secret',
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous key',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key',
  
  // Stripe
  STRIPE_SECRET_KEY: 'Stripe secret key',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook secret',
  
  // Email
  RESEND_API_KEY: 'Resend API key',
  RESEND_FROM_EMAIL: 'Resend from email address',
  
  // Optional but recommended
  ADMIN_EMAIL: 'Admin email (for reports) - OPTIONAL',
};

const optionalEnvVars = {
  ADMIN_EMAIL: 'Admin email for post reports',
};

console.log('🔍 Checking environment variables...\n');

let allSet = true;
const missing = [];
const set = [];

Object.entries(requiredEnvVars).forEach(([key, description]) => {
  const value = process.env[key];
  const isSet = !!value;
  
  if (isSet) {
    set.push({ key, description, value: value.substring(0, 10) + '...' });
    console.log(`✅ ${key}`);
  } else {
    missing.push({ key, description });
    console.log(`❌ ${key} - ${description}`);
    allSet = false;
  }
});

// Check optional
Object.entries(optionalEnvVars).forEach(([key, description]) => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key} (optional)`);
  } else {
    console.log(`⚠️  ${key} (optional) - ${description}`);
  }
});

console.log('\n📊 Summary:');
console.log(`   ✅ Set: ${set.length}/${Object.keys(requiredEnvVars).length}`);
console.log(`   ❌ Missing: ${missing.length}`);

if (missing.length > 0) {
  console.log('\n⚠️  Missing required variables:');
  missing.forEach(({ key, description }) => {
    console.log(`   - ${key}: ${description}`);
  });
  console.log('\n💡 Set these in your .env.local file or Vercel environment variables.\n');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!\n');
  
  // Additional checks
  console.log('🔍 Additional checks:');
  
  const baseUrl = process.env.AUTH0_BASE_URL;
  if (baseUrl && baseUrl.includes('localhost')) {
    console.log('⚠️  AUTH0_BASE_URL contains "localhost" - make sure to update for production!');
  } else if (baseUrl && baseUrl.startsWith('https://')) {
    console.log('✅ AUTH0_BASE_URL looks like production URL');
  }
  
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    console.log('✅ NODE_ENV is set to production');
  } else {
    console.log(`⚠️  NODE_ENV is "${nodeEnv || 'not set'}" - should be "production" in production`);
  }
  
  console.log('');
  process.exit(0);
}

