import { useEffect, useState } from 'react'
import type { LocalUser } from './localAuth'
import { getSession } from './localAuth'

export const useSession = () => {
  const [session, setSession] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSession(getSession())
    setLoading(false)

    const handler = () => {
      setSession(getSession())
    }

    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return { session, loading, setSession }
}
