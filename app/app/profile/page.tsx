'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import RiskProfilePage from '@/app/app/risk-profile/page'

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? '')
        setName((data.user.user_metadata?.name as string | undefined) ?? '')
      }
    })
  }, [])

  const handleSave = async () => {
    if (!supabase) return
    setSaving(true)
    setMessage(null)
    try {
      const updates = await supabase.auth.updateUser({
        email,
        data: { name },
      })
      if (updates.error) {
        setMessage(updates.error.message)
      } else {
        setMessage('Profile updated. Check your email if you changed it.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-10">
      <div className="max-w-xl">
        <h1 className="text-lg font-semibold text-foreground mb-2">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your name and email. Email changes require confirmation.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm text-muted-foreground">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg bg-card border border-border px-3 py-2 text-foreground"
              placeholder="Your name"
            />
          </label>
          <label className="block text-sm text-muted-foreground">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg bg-card border border-border px-3 py-2 text-foreground"
              placeholder="you@example.com"
            />
          </label>
        </div>

        {message && <p className="text-xs text-muted-foreground mt-3">{message}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 px-4 py-2 rounded-lg bg-[#22c55e] text-black text-sm font-semibold hover:bg-[#16a34a] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="max-w-2xl">
        <RiskProfilePage />
      </div>
    </div>
  )
}
