'use client'

import React from 'react'
import Link from 'next/link'

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
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 border border-black p-8 rounded-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="mt-2 text-sm">{description}</p>}
        </div>

        {onSubmit ? (
          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              {children}
            </div>

            {error && <div className="text-red text-sm mt-1">{error}</div>}

            {footer && <div className="mt-4">{footer}</div>}
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              {children}
            </div>

            {error && <div className="text-red text-sm mt-1">{error}</div>}

            {footer && <div className="mt-4">{footer}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
