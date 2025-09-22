import React from 'react'

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-10 pt-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="text-center text-xs text-white/50">
          <p>© {new Date().getFullYear()} FitGen. Modern fitness through AI.</p>
          <p className="mt-1">Built with Next.js, Supabase, and OpenAI</p>
        </div>
      </div>
    </footer>
  )
}
