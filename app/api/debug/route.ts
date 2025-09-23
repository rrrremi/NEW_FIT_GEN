import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKeyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    openaiKeyExists: !!process.env.OPENAI_API_KEY,
    // Add a prefix check (first few characters) to verify without exposing the full key
    openaiKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 3) + '...' : 'not-set',
    supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 8) + '...' : 'not-set',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'not-set',
    nextPhase: process.env.NEXT_PHASE || 'not-set'
  });
}
