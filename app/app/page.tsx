"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { TradingDashboard } from '@/components/trading-dashboard'

type UserState = {
  email?: string
  name?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    if (!supabase) {
      setUser(null)
      setLoading(false)
      return
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!active) {
        return
      }

      if (data.user) {
        setUser({
          email: data.user.email ?? undefined,
          name: (data.user.user_metadata?.name as string | undefined) ?? undefined,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return
      }

      if (session?.user) {
        setUser({
          email: session.user.email ?? undefined,
          name: (session.user.user_metadata?.name as string | undefined) ?? undefined,
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sm text-white/70">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sm text-white/70">Please log in to access the dashboard.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-lg font-semibold text-white mb-6">Dashboard</h1>
      <TradingDashboard />
    </div>
  )
}
