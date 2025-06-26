'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import SignOutButton from '@/components/auth/SignOutButton'
import { Workout } from '@/types/workout'

export default function WorkoutsPage() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hoveredWorkoutId, setHoveredWorkoutId] = useState<string | null>(null)
  const ITEMS_PER_PAGE = 10
  const supabase = createClient()

  // Define fetchWorkouts outside of useEffect so it can be reused
  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Check admin status
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      
      setIsAdmin(!!profileData?.is_admin)

      // Count total workouts for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        throw countError
      }
      
      // Calculate total pages
      const calculatedTotalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE)
      setTotalPages(calculatedTotalPages)
      
      // Fetch workouts with pagination
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)

      if (error) {
        throw error
      }

      setWorkouts(data as Workout[])
    } catch (error) {
      console.error('Error fetching workouts:', error)
      setError('Failed to load workouts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkouts()
  }, [currentPage]) // Note: removed supabase from dependencies since it's now in component scope

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-4xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Your Workouts</h1>
          <div className="flex space-x-2">
            <Button onClick={() => router.push('/protected/workouts/generate')} className="bg-black text-white">
              Workout Generator
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-center mb-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.refresh()}>
              Try Again
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading your workouts...</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="mb-6">You haven't generated any workouts yet.</p>
            <Button onClick={() => router.push('/protected/workouts/generate')}>
              Generate Your First Workout
            </Button>
          </div>
        ) : (
          <>

            <div className="space-y-4">
              {workouts.map((workout) => {
                const handleDelete = async (e: React.MouseEvent) => {
                  e.stopPropagation(); // Prevent navigation to workout details
                  
                  if (confirm('Are you sure you want to delete this workout?')) {
                    try {
                      // First optimistically update the UI
                      const workoutId = workout.id;
                      setWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== workoutId));
                      
                      // Then perform the actual deletion
                      const response = await fetch(`/api/workouts/delete?id=${workoutId}`, {
                        method: 'DELETE',
                      });
                      
                      if (!response.ok) {
                        throw new Error('Failed to delete workout');
                      }
                      
                      // Refresh the page data to ensure everything is in sync
                      setTimeout(() => {
                        router.refresh();
                      }, 100);
                    } catch (error) {
                      console.error('Error deleting workout:', error);
                      setError('Failed to delete workout');
                      
                      // Show error for 3 seconds, then clear it
                      setTimeout(() => {
                        setError(null);
                      }, 3000);
                      
                      // Refetch workouts to restore the list
                      fetchWorkouts();
                    }
                  }
                };
                
                return (
                  <div 
                    key={workout.id} 
                    className="border border-gray-200 p-4 rounded-md hover:bg-gray-50 cursor-pointer relative"
                    onClick={() => router.push(`/protected/workouts/${workout.id}`)}
                    onMouseEnter={() => setHoveredWorkoutId(workout.id)}
                    onMouseLeave={() => setHoveredWorkoutId(null)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {workout.total_duration_minutes} min • {workout.workout_data.exercises.length} exercises
                        </p>
                        <p className="text-sm">{workout.muscle_groups_targeted}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-sm text-gray-600">
                          {new Date(workout.created_at).toLocaleDateString()}
                        </p>
                        {hoveredWorkoutId === workout.id && (
                          <button 
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Delete workout"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            
            </div>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                  aria-label="Previous page"
                >
                  &larr;
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show current page, first, last, and pages around current
                    const shouldShow = pageNum === 1 || 
                                      pageNum === totalPages || 
                                      Math.abs(pageNum - currentPage) <= 1;
                    
                    if (!shouldShow && pageNum === 2 || !shouldShow && pageNum === totalPages - 1) {
                      return <span key={`ellipsis-${pageNum}`} className="px-2">...</span>;
                    }
                    
                    if (!shouldShow) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded ${currentPage === pageNum ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        aria-label={`Page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                  aria-label="Next page"
                >
                  &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </main>
  )
}
