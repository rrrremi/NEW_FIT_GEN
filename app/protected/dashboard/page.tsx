'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import CounterButton from '@/components/counter/CounterButton'
import Card from '@/components/ui/Card'
import SignOutButton from '@/components/auth/SignOutButton'
import { Profile } from '@/types/database'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [clickCount, setClickCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserAndClicks = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }
        
        setUser(user)
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          console.error('Error fetching profile:', profileError)
        } else {
          setProfile(profileData as Profile)
        }
        
        // Get user's click count
        const { data: clicksData, error: clicksError } = await supabase
          .from('clicks')
          .select('click_count')
          .eq('user_id', user.id)
        
        if (clicksError) {
          throw clicksError
        }
        
        const totalClicks = clicksData?.reduce((sum, item) => sum + item.click_count, 0) || 0
        setClickCount(totalClicks)
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserAndClicks()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1 container mx-auto p-4">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            {error && (
              <div className="bg-red-50 border border-red text-red p-4 mb-6 rounded-md">
                {error}
              </div>
            )}
            
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}!</h2>
              <p className="mb-6 text-gray-700">{profile?.email}</p>
              
              <h3 className="text-xl font-bold mb-6">Your Click Count</h3>
              {user && <CounterButton initialCount={clickCount} userId={user.id} />}
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">AI Workout Generator</h3>
              <p className="mb-6">Generate personalized workout routines with our AI-powered tool.</p>
              <div className="flex justify-center">
                <Link href="/protected/workouts/generate" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
                  Generate Workout
                </Link>
              </div>
              <div className="mt-4">
                <Link href="/protected/workouts" className="text-sm underline">
                  View your workouts
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
