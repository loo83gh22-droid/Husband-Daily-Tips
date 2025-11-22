import { createClient } from '@supabase/supabase-js';
import { getSession } from '@auth0/nextjs-auth0';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Get a Supabase client with Row Level Security (RLS) enabled
 * This uses the anon key and sets the auth0_id in the request context
 * so RLS policies can properly filter data by user.
 * 
 * NOTE: This requires that RLS policies check auth0_id via current_setting('app.auth0_id')
 * The auth0_id is passed via a custom header that gets set in the session variable.
 * 
 * IMPORTANT: Since we use Auth0 (not Supabase Auth), we need to:
 * 1. Use the anon key (not service role) to respect RLS
 * 2. Set the auth0_id in the request context via a database function
 * 
 * However, Supabase's PostgREST doesn't natively support custom headers for RLS.
 * Therefore, we'll use this client for queries that need RLS protection,
 * and manually filter by user_id in the WHERE clause as a backup.
 */
export async function getSupabaseWithRLS() {
  const session = await getSession();
  
  if (!session?.user?.sub) {
    throw new Error('Unauthorized: No Auth0 session');
  }

  const auth0Id = session.user.sub;

  // Create client with anon key (RLS will be enforced)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      // Set auth0_id in request headers
      // Note: This won't automatically set current_setting(), but we can use it
      // for manual filtering in queries as a backup
      headers: {
        'x-auth0-id': auth0Id,
      },
    },
  });

  // Try to set the session variable via RPC (if function exists)
  // This is a workaround since PostgREST doesn't natively support custom context
  try {
    await supabase.rpc('set_auth0_context', { auth0_id: auth0Id });
  } catch (error) {
    // Function might not exist yet - that's okay, we'll filter manually
    console.warn('Could not set auth0 context via RPC:', error);
  }

  return supabase;
}

/**
 * Legacy client using service role (bypasses RLS)
 * Use only for admin operations that need to bypass RLS.
 * For user queries, prefer getSupabaseWithRLS() or manual filtering.
 */
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get Supabase client for a specific auth0_id (server-side only)
 * This is a helper for cases where you already have the auth0_id
 * and want to use RLS protection.
 */
export function getSupabaseForAuth0Id(auth0Id: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'x-auth0-id': auth0Id,
      },
    },
  });

  // Try to set context
  supabase.rpc('set_auth0_context', { auth0_id: auth0Id }).catch(() => {
    // Ignore if function doesn't exist
  });

  return supabase;
}

