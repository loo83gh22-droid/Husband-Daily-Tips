import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate and get environment variables with helpful error messages
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Please check your .env.local file or deployment environment variables.`
    );
  }
  return value;
}

// Initialize Supabase client - NEXT_PUBLIC_* vars are available at build time
// Only validate when actually creating the client, not at module load
function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Create client-side Supabase client
export const supabase: SupabaseClient = createSupabaseClient();

// Server-side client with service role key for admin operations
export const getSupabaseAdmin = (): SupabaseClient => {
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};


