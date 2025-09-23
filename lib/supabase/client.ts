import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Check if Supabase credentials exist
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // During build time, return a dummy client
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('Running in build phase - returning dummy Supabase client');
      return {} as any; // Return a dummy client for build phase
    }
    throw new Error('Your project\'s URL and Key are required to create a Supabase client!');
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
