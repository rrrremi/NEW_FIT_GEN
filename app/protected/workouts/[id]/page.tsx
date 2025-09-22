'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Dumbbell, Sparkles, Play, Target, BarChart3, Clock, Calendar, Trash2, ArrowLeft, RefreshCw, Info, Zap, Activity } from 'lucide-react'
import ExerciseVideoButton from '@/components/workout/ExerciseVideoButton'
import { SkeletonWorkoutDetail } from '@/components/ui/Skeleton'
import { Workout } from '@/types/workout'

export default function WorkoutDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const supabase = createClient()

  const goBack = () => {
    router.back()
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      // Use the API endpoint instead of direct Supabase access
      const response = await fetch(`/api/workouts/delete?id=${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete workout');
      }

      // First navigate to the workouts list page
      router.push('/protected/workouts')

      // Add a small delay before refreshing to ensure navigation completes
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error: any) {
      console.error('Error deleting workout:', error)
      setError(error.message || 'Error deleting workout')
      setIsDeleting(false)

      // Show error for 3 seconds, then allow retry
      setTimeout(() => {
        setError(null)
      }, 3000)
    }
  }

  useEffect(() => {
    async function fetchWorkout() {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) {
          throw error
        }

        if (data) {
          setWorkout(data as unknown as Workout)
        } else {
          setError('Workout not found')
        }
      } catch (error: any) {
        setError(error.message || 'An error occurred while fetching the workout')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkout()
  }, [params.id, supabase])

  if (loading) {
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
              Back to Workouts
            </button>
          </Link>
        </div>

        {/* Main Content */}
        <section className="mx-auto w-full max-w-4xl px-4 pb-20">
          <SkeletonWorkoutDetail />
        </section>
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
            Back to Workouts
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

          {/* Header Section */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight flex items-center">
                    <Dumbbell className="h-8 w-8 mr-3 text-fuchsia-400" />
                    Workout Details
                  </h1>
                  <p className="mt-2 text-sm text-white/70">Review your personalized workout and get ready to crush it!</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/protected/workouts/generate">
                    <button className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/90 hover:bg-white/20 transition-colors flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Generate New
                    </button>
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-colors"
                    disabled={isDeleting}
                    aria-label="Delete workout"
                  >
                    {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 backdrop-blur-xl">
                  {error}
                </div>
              )}
            </div>
          </div>

          {workout && (
            <>
              {/* Workout Overview */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 className="text-lg font-medium text-white/90 flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Workout Overview
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Clock className="h-4 w-4" />
                            Duration
                          </div>
                          <span className="text-lg font-semibold text-white/90">{workout.total_duration_minutes} min</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-white/60">
                            <Target className="h-4 w-4" />
                            Focus
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(() => {
                              // Handle different possible formats of workout_focus
                              let focusArray = [];
                              
                              if (Array.isArray(workout.workout_focus)) {
                                focusArray = workout.workout_focus;
                              } else if (typeof workout.workout_focus === 'string') {
                                // Handle case where workout_focus is a string
                                const focusValue = workout.workout_focus;
                                
                                if (focusValue.startsWith('[') && focusValue.endsWith(']')) {
                                  try {
                                    focusArray = JSON.parse(focusValue);
                                  } catch (e) {
                                    // If parsing fails, treat as a single string
                                    focusArray = [focusValue];
                                  }
                                } else {
                                  focusArray = [focusValue];
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
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <BarChart3 className="h-4 w-4" />
                            Exercises
                          </div>
                          <span className="text-lg font-semibold text-white/90">{workout.workout_data.exercises.length}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Calendar className="h-4 w-4" />
                            Created
                          </div>
                          <span className="text-sm text-white/90">{new Date(workout.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
                          <Activity className="h-4 w-4" />
                          Muscle Groups
                        </div>
                        <p className="text-white/90">{workout.muscle_groups_targeted}</p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
                          <Zap className="h-4 w-4" />
                          Equipment Needed
                        </div>
                        <p className="text-white/90">{workout.equipment_needed}</p>
                      </div>

                      {workout.muscle_focus && (Array.isArray(workout.muscle_focus) ? workout.muscle_focus.length > 0 : workout.muscle_focus) && (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
                            <Target className="h-4 w-4" />
                            Specific Focus Areas
                          </div>
                          <p className="text-white/90">
                            {Array.isArray(workout.muscle_focus) 
                              ? workout.muscle_focus.map((m: string) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')
                              : typeof workout.muscle_focus === 'string' 
                                ? workout.muscle_focus.charAt(0).toUpperCase() + workout.muscle_focus.slice(1)
                                : ''
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Exercises */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 className="text-lg font-medium text-white/90 flex items-center">
                      <Dumbbell className="h-5 w-5 mr-2" />
                      Exercises ({workout.workout_data.exercises.length})
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {workout.workout_data.exercises.map((exercise, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + index * 0.05 }}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20 border border-white/10 text-sm font-medium text-white/90">
                              {index + 1}
                            </div>
                            <h4 className="text-lg font-medium text-white/90">{exercise.name}</h4>
                          </div>
                          <ExerciseVideoButton exerciseName={exercise.name} size="small" variant="subtle" />
                        </div>

                        {exercise.rationale && (
                          <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
                            <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                              <Info className="h-3 w-3" />
                              HOW TO / BENEFITS / RISKS
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed">{exercise.rationale}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center rounded-lg border border-white/10 bg-white/5 p-3">
                            <div className="text-xs text-white/60 mb-1">Sets</div>
                            <div className="text-lg font-semibold text-white/90">{exercise.sets}</div>
                          </div>
                          <div className="text-center rounded-lg border border-white/10 bg-white/5 p-3">
                            <div className="text-xs text-white/60 mb-1">Reps</div>
                            <div className="text-lg font-semibold text-white/90">{exercise.reps}</div>
                          </div>
                          <div className="text-center rounded-lg border border-white/10 bg-white/5 p-3">
                            <div className="text-xs text-white/60 mb-1">Rest</div>
                            <div className="text-lg font-semibold text-white/90">{exercise.rest_time_seconds}s</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </section>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-white/90 mb-3">Delete Workout</h3>
            <p className="text-sm text-white/70 mb-6">Are you sure you want to delete this workout? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
