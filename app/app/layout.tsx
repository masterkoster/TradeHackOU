'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Sidebar } from '@/components/sidebar'
import { RiskProfileProvider } from '@/contexts/RiskProfileContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let active = true

    if (!supabase) {
      router.replace('/')
      setLoading(false)
      return
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      if (data.user) {
        setAuthed(true)
      } else {
        router.replace('/')
      }
      setLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (!session) {
        router.replace('/')
      }
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authed) return null

  return (
    <RiskProfileProvider>
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto min-h-screen">
          {children}
        </main>
      </div>
    </RiskProfileProvider>
  )
}
