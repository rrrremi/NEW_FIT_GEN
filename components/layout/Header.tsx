'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Check if user is admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

          setIsAdmin(!!profile?.is_admin)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
        if (!session?.user) {
          setIsAdmin(false)
        }
      }
    )

    fetchUser()
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  // Don't show header on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null
  }

  return (
    <header className="border-b border-black p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={user ? '/protected/dashboard' : '/'} className="text-2xl font-bold">
          Counter App
        </Link>
        
        {loading ? (
          // Show loading indicator while authentication state is being determined
          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  href="/protected/dashboard" 
                  className={`hover:opacity-80 ${pathname === '/protected/dashboard' ? 'font-bold' : ''}`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/protected/workouts" 
                  className={`hover:opacity-80 ${pathname?.startsWith('/protected/workouts') ? 'font-bold' : ''}`}
                >
                  Workouts
                </Link>
                <Link 
                  href="/protected/profile" 
                  className={`hover:opacity-80 ${pathname?.startsWith('/protected/profile') ? 'font-bold' : ''}`}
                >
                  Profile
                </Link>
                {isAdmin && (
                  <Link 
                    href="/protected/admin" 
                    className={`hover:opacity-80 ${pathname === '/protected/admin' ? 'font-bold' : ''}`}
                  >
                    Admin
                  </Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="px-3 py-1 bg-white text-black border border-black rounded-md hover:opacity-80 text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="hover:opacity-80"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="px-3 py-1 bg-black text-white rounded-md hover:opacity-80"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
