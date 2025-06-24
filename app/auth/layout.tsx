import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  
  // Check if user is already authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/protected/dashboard')
  }
  
  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center py-8">
        <Link href="/" className="text-2xl font-bold">
          Counter App
        </Link>
      </div>
      {children}
    </div>
  )
}
