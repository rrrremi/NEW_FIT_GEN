'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Search, Shield, Mail, Calendar, BarChart3, ArrowLeft, RefreshCw, Crown } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [resetEmailStatus, setResetEmailStatus] = useState<{ email: string; status: 'loading' | 'success' | 'error'; message?: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        if (!profile?.is_admin) {
          router.push('/protected/workouts')
          return
        }

        // Fetch all users with their workout counts
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (userError) {
          throw userError
        }

        // Get workout counts for each user
        const usersWithStats = await Promise.all(
          (userData || []).map(async (user) => {
            const { count: workoutCount } = await supabase
              .from('workouts')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)

            return {
              ...user,
              workoutCount: workoutCount || 0
            }
          })
        )

        setUsers(usersWithStats)
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndFetchUsers()
  }, [router, supabase])

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const sendPasswordReset = async (email: string) => {
    try {
      setResetEmailStatus({ email, status: 'loading' })

      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send password reset email')
      }

      setResetEmailStatus({
        email,
        status: 'success',
        message: 'Password reset email sent successfully'
      })

      // Clear success message after 5 seconds
      setTimeout(() => {
        setResetEmailStatus(prev => prev?.email === email ? null : prev)
      }, 5000)
    } catch (error) {
      console.error('Error sending password reset email:', error)
      setResetEmailStatus({
        email,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to send password reset email'
      })
    }
  }

  if (loading) {
    return (
      <>
        {/* Background accents */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
        </div>
        <div className="flex items-center justify-center">
          <div className="text-center py-6">
            <svg className="animate-spin h-6 w-6 text-white mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-white/70">Loading admin panel...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4">
        <Link href="/protected/workouts">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Main Content */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >

          {/* Header Section */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight flex items-center">
                    <Shield className="h-8 w-8 mr-3 text-fuchsia-400" />
                    Admin Panel
                  </h1>
                  <p className="mt-2 text-sm text-white/70">Manage users, monitor activity, and oversee platform operations</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-white/90">Administrator</span>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 backdrop-blur-xl">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white/70">Total Users</h3>
                    <p className="text-2xl font-bold text-white/90">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-fuchsia-400" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white/70">Total Workouts</h3>
                    <p className="text-2xl font-bold text-white/90">{users.reduce((sum, user) => sum + user.workoutCount, 0)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-cyan-400" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white/70">Admins</h3>
                    <p className="text-2xl font-bold text-white/90">{users.filter(user => user.is_admin).length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* User Management */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-lg font-medium text-white/90 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Management
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/90 placeholder-white/40 backdrop-blur-xl focus:ring-1 focus:ring-white/20 focus:border-white/20"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-xs font-medium text-white/70">User</th>
                      <th className="text-left p-4 text-xs font-medium text-white/70">Role</th>
                      <th className="text-left p-4 text-xs font-medium text-white/70">Joined</th>
                      <th className="text-left p-4 text-xs font-medium text-white/70">Workouts</th>
                      <th className="text-left p-4 text-xs font-medium text-white/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4">
                            <div>
                              <p className="text-sm font-medium text-white/90">{user.email}</p>
                              <p className="text-xs text-white/60">{user.full_name || 'No name set'}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.is_admin
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/20'
                                : 'bg-white/10 text-white/70 border border-white/10'
                            }`}>
                              {user.is_admin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-white/40" />
                              <span className="text-sm text-white/80">
                                {new Date(user.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-medium text-white/90">{user.workoutCount}</span>
                          </td>
                          <td className="p-4">
                            {resetEmailStatus && resetEmailStatus.email === user.email ? (
                              <div className="flex items-center gap-2">
                                {resetEmailStatus.status === 'loading' && (
                                  <>
                                    <RefreshCw className="h-4 w-4 animate-spin text-white/60" />
                                    <span className="text-xs text-white/60">Sending...</span>
                                  </>
                                )}
                                {resetEmailStatus.status === 'success' && (
                                  <span className="text-xs text-green-400">✓ Email sent</span>
                                )}
                                {resetEmailStatus.status === 'error' && (
                                  <span className="text-xs text-red-400">✗ Failed</span>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => sendPasswordReset(user.email)}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/90 hover:bg-white/20 transition-colors"
                              >
                                <Mail className="h-3 w-3" />
                                Reset Password
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <div className="text-white/60">
                            {searchTerm ? 'No users match your search' : 'No users found'}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </>
  )
}
