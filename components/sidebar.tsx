'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, BarChart2, ArrowLeftRight, Shield, LogOut, Compass } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { FinbroLogo } from './finbro-logo'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { label: 'Analytics', href: '/app/analytics', icon: BarChart2 },
  { label: 'Explore', href: '/app/explore', icon: Compass },
  { label: 'Compare', href: '/app/compare', icon: ArrowLeftRight },
  { label: 'Risk Profile', href: '/app/risk-profile', icon: Shield },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/')
  }

  return (
    <aside className="w-56 min-h-screen bg-[#0D0D0D] border-r border-white/10 flex flex-col shrink-0">
      <div className="p-4 border-b border-white/10">
        <FinbroLogo className="h-6 w-auto text-white" />
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[#22c55e]/10 text-[#22c55e]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
