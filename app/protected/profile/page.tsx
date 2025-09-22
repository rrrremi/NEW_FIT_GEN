'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, BarChart3, Settings, ArrowLeft, Edit } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [workoutCount, setWorkoutCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        setProfile(profileData)

        // Get user's workout count
        const { count } = await supabase
          .from('workouts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        setWorkoutCount(count || 0)
      } catch (err) {
        console.error('Error fetching profile data:', err)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [router, supabase])

  if (loading) {
    return (
      <>
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
            <p className="text-sm text-white/70">Loading...</p>
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
      <section className="mx-auto w-full max-w-4xl px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >

          {/* Profile Header */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">Your Profile</h1>
                  <p className="mt-2 text-sm text-white/70">Manage your account settings and view your stats</p>
                </div>
                <Link href="/protected/profile/edit">
                  <button className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/90 hover:bg-white/20 transition-colors flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </button>
                </Link>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 backdrop-blur-xl mb-6">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Profile Information Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Information */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h3 className="text-sm font-medium text-white/90 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Account Information
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <span className="text-sm text-white/90">{profile?.email}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <User className="h-4 w-4" />
                      Full Name
                    </div>
                    <span className="text-sm text-white/90">{profile?.full_name || 'Not set'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </div>
                    <span className="text-sm text-white/90">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <Settings className="h-4 w-4" />
                      Account Type
                    </div>
                    <span className="text-sm text-white/90">{profile?.is_admin ? 'Administrator' : 'Member'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Fitness Stats */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h3 className="text-sm font-medium text-white/90 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Fitness Statistics
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <BarChart3 className="h-4 w-4" />
                      Total Workouts
                    </div>
                    <span className="text-lg font-semibold text-white/90">{workoutCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <Calendar className="h-4 w-4" />
                      Daily Limit
                    </div>
                    <span className="text-sm text-white/90">100 workouts/day</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <User className="h-4 w-4" />
                      Status
                    </div>
                    <span className="text-sm text-white/90">{profile?.is_admin ? 'Premium' : 'Active'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-sm font-medium text-white/90">Quick Actions</h3>
              </div>
              <div className="p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href="/protected/workouts/generate">
                    <button className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 hover:bg-white/20 transition-colors text-left">
                      Generate New Workout
                    </button>
                  </Link>
                  <Link href="/protected/workouts">
                    <button className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 hover:bg-white/20 transition-colors text-left">
                      View Workout History
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </>
  )
}
