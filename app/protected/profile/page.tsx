'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import SignOutButton from '@/components/auth/SignOutButton'
import Link from 'next/link'
import { Profile } from '@/types/database'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [clickCount, setClickCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfileAndClicks = async () => {
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
        
        setProfile(profileData as Profile)
        
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
        console.error('Error fetching profile data:', err)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfileAndClicks()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1 container mx-auto p-4 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red text-red p-4 mb-6 rounded-md">
            {error}
          </div>
        )}
        
        <Card>
          <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-lg">{profile?.email}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Full Name</p>
              <p className="text-lg">{profile?.full_name || '-'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Account Created</p>
              <p className="text-lg">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Total Clicks</p>
              <p className="text-lg font-bold">{clickCount}</p>
            </div>
          </div>
        </Card>
        
        <div className="pt-4">
          <Link href="/protected/dashboard" className="btn block text-center">
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
