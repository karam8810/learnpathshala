import { createClient } from '@supabase/supabase-js';

/**
 * ============================================================
 * SUPABASE ADMIN CLIENT
 * ============================================================
 *
 * SERVER ONLY
 *
 * This client uses the Supabase service-role key.
 *
 * IMPORTANT:
 * - Never import this file into a Client Component.
 * - Never use NEXT_PUBLIC_ for the service-role key.
 * - Never expose the service-role key to the browser.
 *
 * This client is used by Server Components / API routes /
 * server-side functions where RLS needs to be bypassed.
 * ============================================================
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable.'
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY environment variable.'
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);