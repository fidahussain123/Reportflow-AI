'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Settings,
  LogOut,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useState } from 'react'
import Logo from '@/components/Logo'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FilePlus, label: 'New Report', path: '/dashboard/new-report' },
  { icon: FileText, label: 'Reports', path: '/dashboard/reports' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const creditsPercent = profile
    ? Math.min((profile.credits_used / profile.credits_limit) * 100, 100)
    : 0

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-64 border-r border-white/[0.06] flex flex-col h-screen sticky top-0 bg-black/50 backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.06]">
        <Logo href="/dashboard" size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path !== '/dashboard' && pathname.startsWith(item.path))
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm group',
                isActive
                  ? 'text-white'
                  : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/[0.08] border border-white/[0.08] rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Credits */}
      {profile && (
        <div className="mx-3 mb-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex justify-between text-xs text-white/40 mb-2.5">
            <span>Credits Used</span>
            <span className="text-white/60 font-medium">{profile.credits_used} / {profile.credits_limit}</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${creditsPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className={cn(
                'h-full rounded-full transition-colors',
                creditsPercent > 80 ? 'bg-red-400/80' : creditsPercent > 50 ? 'bg-amber-400/60' : 'bg-white/40'
              )}
            />
          </div>
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-medium text-white/60">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80 truncate font-medium">{displayName}</p>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors duration-300 mt-0.5"
            >
              {loggingOut ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <LogOut className="w-3 h-3" />
              )}
              Sign out
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
