'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import SignOutButton from '@/components/auth/SignOutButton'
import ExerciseVideoButton from '@/components/workout/ExerciseVideoButton'
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

  return (
    <main className="flex flex-col items-center min-h-screen p-4">
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
            <p className="text-sm text-gray-600">Loading workout...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded mb-4 w-full max-w-3xl text-sm">
          {error}
        </div>
      ) : workout ? (
        <div className="w-full max-w-3xl border border-black rounded-md p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Workout Details</h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={goBack}
                className="text-xs font-medium hover:opacity-70 flex items-center"
              >
                <span className="mr-1">←</span> Back
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs font-medium hover:opacity-80 bg-black text-white px-3 py-1.5 rounded flex items-center"
                disabled={isDeleting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <Link href="/protected/workouts/generate" className="text-xs font-medium hover:opacity-70 bg-black text-white px-2 py-1 rounded">
                Generate New
              </Link>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 pb-1 border-b">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-28 font-medium">Duration:</span>
                  <span>{workout.total_duration_minutes} minutes</span>
                </div>
                <div className="flex items-center">
                  <span className="w-28 font-medium">Muscle Groups:</span>
                  <span>{workout.muscle_groups_targeted}</span>
                </div>
                {workout.muscle_focus && workout.muscle_focus.length > 0 && (
                  <div className="flex items-center">
                    <span className="w-28 font-medium">Focus Areas:</span>
                    <span>{workout.muscle_focus.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-28 font-medium">Joint Groups:</span>
                  <span>{workout.joint_groups_affected}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-28 font-medium">Equipment:</span>
                  <span>{workout.equipment_needed}</span>
                </div>
                {workout.workout_focus && (
                  <div className="flex items-center">
                    <span className="w-28 font-medium">Training Style:</span>
                    <span>{workout.workout_focus.charAt(0).toUpperCase() + workout.workout_focus.slice(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-3 pb-1 border-b">Exercises</h2>
            <div className="space-y-4">
              {workout.workout_data.exercises.map((exercise, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-3 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold flex items-center">
                      <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">{index + 1}</span>
                      {exercise.name}
                    </h3>
                    <ExerciseVideoButton exerciseName={exercise.name} size="small" variant="subtle" />
                  </div>
                  <p className="mb-3 text-gray-700 text-sm">{exercise.rationale}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                    <div className="text-center">
                      <p className="font-medium mb-1">Sets</p>
                      <p className="text-base">{exercise.sets}</p>
                    </div>
                    <div className="text-center border-x border-gray-200">
                      <p className="font-medium mb-1">Reps</p>
                      <p className="text-base">{exercise.reps}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium mb-1">Rest</p>
                      <p className="text-base">{exercise.rest_time_seconds}s</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-3">Delete Workout</h3>
            <p className="mb-4 text-sm">Are you sure you want to delete this workout? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="px-3 py-1.5 text-sm bg-black text-white rounded hover:opacity-80 flex items-center"
                disabled={isDeleting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
