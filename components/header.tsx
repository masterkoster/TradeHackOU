"use client"

import { useEffect, useState } from 'react'
import { FinbroLogo } from "@/components/finbro-logo"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { supabase } from '@/lib/supabaseClient'

const navItems = ['Markets', 'Pricing', 'About']

export function Header() {
  const [open, setOpen] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session?.user)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    window.location.href = '/'
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-black/10 dark:border-white/10">
      <div className="flex items-center gap-8 min-w-0">
        <FinbroLogo className="text-black dark:text-white h-8 w-auto shrink-0" />
        <nav className="hidden lg:flex items-center gap-6 text-[15px] text-black/60 dark:text-white/60">
          {navItems.map((item) => (
            <button key={item} className="hover:text-black dark:hover:text-white transition-colors whitespace-nowrap">
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />
        {authed ? (
          <div className="relative group">
            <Button variant="ghost" className="text-black dark:text-white text-[15px]">
              Profile
            </Button>
            <div className="absolute right-0 mt-2 w-36 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
              <button
                className="w-full text-left px-3 py-2 text-sm text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              className="text-black dark:text-white text-[15px] whitespace-nowrap"
              onClick={() => setOpen(true)}
            >
              Login
            </Button>
            <Button
              className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black text-[15px] whitespace-nowrap"
              onClick={() => setOpen(true)}
            >
              Open Account
            </Button>
          </>
        )}
      </div>

      <AuthModal open={open} onOpenChange={setOpen} />
    </header>
  )
}
