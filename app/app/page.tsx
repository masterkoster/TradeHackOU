"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'

type UserState = {
  email?: string
  name?: string
}

export default function AppPage() {
  const [user, setUser] = useState<UserState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase().auth.getUser().then(({ data }) => {
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

    const { data: authListener } = supabase().auth.onAuthStateChange((_event, session) => {
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

  const handleSignOut = async () => {
    await supabase().auth.signOut()
    setUser(null)
  }

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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <p className="text-sm text-white/70">
        Welcome, {user.name ?? user.email}.
      </p>
      <Button onClick={handleSignOut}>Sign out</Button>
    </div>
  )
}
