'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Dumbbell, Sparkles, Target, Clock, BarChart3, Trash2, AlertCircle } from 'lucide-react'

// Number of workouts to load per page for infinite scroll
const WORKOUTS_PER_PAGE = 10

export default function WorkoutsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Workout list with infinite scroll
  const [workouts, setWorkouts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const observer = useRef<IntersectionObserver | null>(null)
  const lastWorkoutElementRef = useRef<HTMLDivElement | null>(null)
  
  const supabase = createClient()
  
  const ITEMS_PER_PAGE = 10

  // Load initial user data and workouts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }
        
        setUser(user)
        
        // Check if user is admin
        const { data: profileData } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
        setIsAdmin(!!profileData?.is_admin)
        
        // Load initial workouts
        fetchWorkouts()
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, router])
  
  // Fetch workouts with infinite scroll
  const fetchWorkouts = async (pageNumber = 1, append = false) => {
    try {
      if (pageNumber === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data: profileData } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      setIsAdmin(!!profileData?.is_admin)
      
      const from = (pageNumber - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      
      const { data, error } = await supabase
        .from('workouts')
        .select(
          'id, created_at, total_duration_minutes, muscle_focus, workout_focus, workout_data'
        )
        .order('created_at', { ascending: false })
        .range(from, to)
      
      if (error) throw error
      
      if (data) {
        if (append) {
          setWorkouts(prev => [...prev, ...data])
        } else {
          setWorkouts(data)
        }
        
        // If we got fewer results than requested, there are no more
        setHasMore(data.length === ITEMS_PER_PAGE)
      }
    } catch (error) {
      console.error('Error fetching workouts:', error)
      setError('Failed to load workouts')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }
  
  // Handle workout deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return
    
    try {
      const { error } = await supabase.from('workouts').delete().eq('id', id)
      if (error) throw error
      
      // Refresh the list
      fetchWorkouts()
    } catch (err) {
      console.error('Error deleting workout:', err)
      alert('Failed to delete workout')
    }
  }
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }
  
  // Refetch workouts when page changes
  useEffect(() => {
    fetchWorkouts()
  }, [currentPage])

  if (loading && workouts.length === 0) {
    return (
      <>
        {/* Background accents */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
        </div>

        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-fuchsia-500 border-t-transparent rounded-full"></div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
      </div>

      {/* Floating Action Button for Generate Workout */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/protected/workouts/generate">
          <button className="h-14 px-5 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 flex items-center justify-center shadow-lg hover:shadow-xl transition-all group">
            <Sparkles className="h-6 w-6 text-white mr-2" />
            <span className="text-white font-medium hidden sm:inline">Generate Workout</span>
          </button>
        </Link>
      </div>

      {/* Main Content */}
      <section className="mx-auto mt-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 lg:space-y-8"
        >
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-2xl">
            <div className="absolute -right-12 -top-12 h-32 w-32 sm:h-48 sm:w-48 lg:h-64 lg:w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 sm:h-48 sm:w-48 lg:h-64 lg:w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-3">
                    <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-fuchsia-400" />
                    Your Workouts
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-white/70">
                    View and manage your personalized workout history
                  </p>
                </div>

                <Link href="/protected/workouts/generate">
                  <button className="btn-touch hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20 px-4 sm:px-5 py-3 text-sm font-medium text-white/90 backdrop-blur-xl hover:bg-white/10 transition-colors focus-ring">
                    <Sparkles className="h-4 w-4" />
                    Generate New
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Workout List */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-fuchsia-400" />
                <span className="text-base sm:text-lg font-medium text-white/90">Workout History</span>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-200 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {workouts.length > 0 ? (
                <div className="space-y-3">
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      onClick={() => router.push(`/protected/workouts/${workout.id}`)}
                      className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/10 transition-all duration-200 focus-ring cursor-pointer"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white/90 truncate pr-2">
                                  Workout {new Date(workout.created_at).toLocaleDateString()}
                                </h3>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {(() => {
                                    // Handle different possible formats of workout_focus
                                    let focusArray = [];
                                    
                                    if (Array.isArray(workout.workout_focus)) {
                                      focusArray = workout.workout_focus;
                                    } else if (typeof workout.workout_focus === 'string') {
                                      // Try to parse if it looks like a JSON array
                                      if (workout.workout_focus.startsWith('[') && workout.workout_focus.endsWith(']')) {
                                        try {
                                          focusArray = JSON.parse(workout.workout_focus);
                                        } catch (e) {
                                          // If parsing fails, treat as a single string
                                          focusArray = [workout.workout_focus];
                                        }
                                      } else {
                                        focusArray = [workout.workout_focus];
                                      }
                                    }
                                    
                                    return focusArray.map((focus: string, i: number) => {
                                      // Clean up any remaining quotes
                                      const cleanFocus = typeof focus === 'string' ? focus.replace(/["']/g, '') : focus;
                                      return (
                                        <span key={i} className="text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 capitalize">
                                          {cleanFocus}
                                        </span>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 rounded-full bg-fuchsia-400 group-hover:bg-cyan-400 transition-colors" />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-white/50 mt-3">
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                <span>{workout.workout_data.exercises.length} exercises</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{workout.total_duration_minutes} min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                <span>{workout.muscle_focus.join(', ')}</span>
                              </div>
                            </div>
                          </div>

                          {isAdmin && (
                            <div className="flex-shrink-0 self-start">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(workout.id);
                                }}
                                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-red-400 transition-colors"
                                aria-label="Delete workout"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Dumbbell className="h-8 w-8 text-white/30" />
                  </div>
                  <h3 className="text-lg font-medium text-white/80 mb-2">No workouts yet</h3>
                  <p className="text-sm text-white/50 max-w-md mb-6">
                    Generate your first workout to get started on your fitness journey
                  </p>
                  <Link href="/protected/workouts/generate">
                    <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl hover:bg-white/10 transition-colors">
                      <Sparkles className="h-4 w-4" />
                      Generate Your First Workout
                    </button>
                  </Link>
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20 text-white border border-white/20'
                            : 'text-white/60 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </>
  )
}
