import { NextResponse } from 'next/server';

// This is an enhanced version of the debug endpoint that provides more detailed environment information
export async function GET() {
  return NextResponse.json({
    // Supabase environment variables
    supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKeyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    
    // OpenAI environment variables
    openaiKeyExists: !!process.env.OPENAI_API_KEY,
    
    // Safe prefixes (first few characters only) to verify without exposing full keys
    openaiKeyPrefix: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 3)}...` : 'not-set',
    supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 8)}...` : 'not-set',
    
    // Next.js environment information
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'not-set',
    nextPhase: process.env.NEXT_PHASE || 'not-set',
    
    // Build information
    buildTime: new Date().toISOString(),
    buildId: process.env.VERCEL_GIT_COMMIT_SHA || 'local-build'
  });
}
