'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import SignOutButton from '@/components/auth/SignOutButton'
import { UserStatistics } from '@/types/database'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserStatistics[]>([])
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
          router.push('/protected/dashboard')
          return
        }

        // Fetch all users with their click counts
        const { data: userData, error: userError } = await supabase
          .from('user_statistics')
          .select('*')
          .order('email')

        if (userError) {
          throw userError
        }

        setUsers(userData as UserStatistics[])
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
      <div className="flex items-center justify-center p-4">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      
      <main className="flex-1 container mx-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red text-red p-4 mb-6 rounded-md">
            {error}
          </div>
        )}
      
      <Card className="mb-6">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <div className="mb-4">
          <Input
            placeholder="Search users by email or name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
          />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Registered</th>
                <th className="text-left p-4">Total Clicks</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-black hover:bg-gray-50">
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.full_name || '-'}</td>
                    <td className="p-4">{user.is_admin ? 'Admin' : 'User'}</td>
                    <td className="p-4">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-4 font-bold">{user.total_clicks}</td>
                    <td className="p-4">
                      {resetEmailStatus?.email === user.email ? (
                        <div className="flex items-center">
                          {resetEmailStatus.status === 'loading' && (
                            <span className="text-sm">Sending...</span>
                          )}
                          {resetEmailStatus.status === 'success' && (
                            <span className="text-sm text-green-600">{resetEmailStatus.message}</span>
                          )}
                          {resetEmailStatus.status === 'error' && (
                            <span className="text-sm text-red-600">{resetEmailStatus.message}</span>
                          )}
                        </div>
                      ) : (
                        <Button 
                          onClick={() => sendPasswordReset(user.email)}
                          className="text-sm py-1 px-2"
                        >
                          Reset Password
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center">
                    {searchTerm ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </main>
    </div>
  )
}
