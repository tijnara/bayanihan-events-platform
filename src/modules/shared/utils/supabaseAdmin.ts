import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for Admin client.');
}

/**
 * Service Role Supabase client that bypasses RLS for Server Actions.
 * NEVER expose or import this file in client-side ('use client') components.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});