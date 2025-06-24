'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { Profile } from '@/types/database'
import SignOutButton from '@/components/auth/SignOutButton'

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
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
        setFullName(profileData?.full_name || '')
      } catch (err) {
        console.error('Error fetching profile data:', err)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      if (!profile) {
        throw new Error('Profile not found')
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id)

      if (updateError) {
        throw updateError
      }

      // Update user metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      setSuccess(true)
      
      // Redirect back to profile after a short delay
      setTimeout(() => {
        router.push('/protected/profile')
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

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
        
        {success && (
          <div className="bg-green-50 border border-green-600 text-green-600 p-4 mb-6 rounded-md">
            Profile updated successfully!
          </div>
        )}
        
        <Card>
          <h2 className="text-2xl font-bold mb-6">Edit Your Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-1">Email</p>
              <p className="text-lg">{profile?.email}</p>
            </div>
            
            <Input
              id="fullName"
              name="fullName"
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
            
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                variant="primary"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Link href="/protected/profile">
                <Button
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
