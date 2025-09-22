'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  User,
  BarChart3,
  Shield,
  Menu,
  X,
  Sparkles,
  Settings,
  LogOut,
  Home,
  Target
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        // Check admin status
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        setIsAdmin(profile?.is_admin || false)
      }
    }
    loadUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    setIsMenuOpen(false)
  }

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home, showAlways: true },
    { href: '/protected/workouts', label: 'Dashboard', icon: Target, showAlways: true },
    { href: '/protected/profile', label: 'Profile', icon: User, requiresAuth: true },
    { href: '/protected/workouts', label: 'Workouts', icon: Dumbbell, requiresAuth: true },
    { href: '/protected/admin', label: 'Admin', icon: Shield, requiresAuth: true, requiresAdmin: true },
  ]

  const filteredNavItems = navigationItems.filter(item =>
    (!item.requiresAuth || user) &&
    (!item.requiresAdmin || isAdmin) &&
    item.showAlways
  )

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-2xl safe-area-top">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 focus-ring rounded-lg p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20">
              <Dumbbell className="h-5 w-5 text-fuchsia-400" />
            </div>
            <span className="hidden font-bold text-xl bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent sm:block">
              FitGen
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveLink(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 focus-ring ${
                    isActive
                      ? 'bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20 text-white border border-white/20'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side - Auth/User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* User Menu - Desktop */}
                <div className="hidden md:flex items-center gap-2">
                  {/* Admin Button - Always visible for quick access */}
                  <Link
                    href="/protected/admin"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors focus-ring"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                  
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80">
                    <User className="h-4 w-4" />
                    <span className="truncate max-w-32">{user.email?.split('@')[0]}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors focus-ring"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors focus-ring"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? (
                    <X className="h-5 w-5 text-white" />
                  ) : (
                    <Menu className="h-5 w-5 text-white" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors focus-ring"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-xl border border-white/10 bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors focus-ring"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && user && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-2xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20">
                    <User className="h-5 w-5 text-fuchsia-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-white/60 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Navigation Links */}
                {filteredNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveLink(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 focus-ring ${
                        isActive
                          ? 'bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20 text-white border border-white/20'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                      {isActive && <Sparkles className="h-4 w-4 ml-auto text-fuchsia-400" />}
                    </Link>
                  )
                })}

                {/* Admin Button - Always visible for quick access */}
                <Link
                  href="/protected/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-ring"
                >
                  <Shield className="h-5 w-5" />
                  Admin
                </Link>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-ring"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
