'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Dumbbell } from 'lucide-react'

interface AuthFormProps {
  title: string
  description?: string
  footer?: React.ReactNode
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  error?: string | null
}

export default function AuthForm({
  title,
  description,
  footer,
  children,
  onSubmit,
  error
}: AuthFormProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo/Brand */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 shadow-inner">
                <Dumbbell className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-white/90">FitGen</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-white/90">{title}</h1>
              {description && <p className="mt-2 text-sm text-white/70">{description}</p>}
            </div>

            {onSubmit ? (
              <form className="space-y-6" onSubmit={onSubmit}>
                <div className="space-y-4">
                  {children}
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300 backdrop-blur-xl">
                    {error}
                  </div>
                )}

                {footer && <div className="mt-6">{footer}</div>}
              </form>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  {children}
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300 backdrop-blur-xl">
                    {error}
                  </div>
                )}

                {footer && <div className="mt-6">{footer}</div>}
              </div>
            )}
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-white/50 hover:text-white/70 transition-colors">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
