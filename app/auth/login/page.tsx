'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthForm from '@/components/auth/AuthForm'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      // Update session if remember me is checked
      if (rememberMe && !error) {
        await supabase.auth.refreshSession({
          refresh_token: (await supabase.auth.getSession()).data.session?.refresh_token || ''
        })
      }

      if (error) {
        setError(error.message)
        return
      }

      router.push('/protected/dashboard')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm
      title="Sign In"
      description="Welcome back! Please sign in to continue."
      error={error}
      onSubmit={handleLogin}
      footer={
        <div className="text-center">
          <p className="text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      }
    >
      <Input
        id="email"
        name="email"
        type="email"
        label="Email address"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link href="/auth/reset-password" className="font-medium hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        variant="primary"
        fullWidth
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </AuthForm>
  )
}
