'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, BarChart2, ArrowLeftRight, Shield, LogOut, Compass, Star } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { FinbroLogo } from './finbro-logo'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { label: 'Analytics', href: '/app/analytics', icon: BarChart2 },
  { label: 'Explore', href: '/app/explore', icon: Compass },
  { label: 'Compare', href: '/app/compare', icon: ArrowLeftRight },
  { label: 'Favorites', href: '/app/favorites', icon: Star },
  { label: 'Risk Profile', href: '/app/risk-profile', icon: Shield },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.href.replace('/app', ''))
      .map((id) => (id === '' ? 'dashboard' : id.replace('/', '')))

    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (nodes.length === 0) {
      setActiveId(null)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.2, 0.6, 1] }
    )

    nodes.forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, [])

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/')
  }

  return (
    <aside className="w-56 min-h-screen bg-[#0D0D0D] border-r border-white/10 flex flex-col shrink-0 sticky top-0">
      <div className="p-4 border-b border-white/10">
        <FinbroLogo className="h-6 w-auto text-white" />
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const activeRoute = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
          const sectionId = href.replace('/app', '')
          const normalizedId = sectionId === '' ? 'dashboard' : sectionId.replace('/', '')
          const activeScroll = activeId === normalizedId
          const active = activeRoute || activeScroll
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
