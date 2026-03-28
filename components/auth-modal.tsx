"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'

type AuthModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    setMessage('')
    setBusy(true)

    try {
      if (!supabase) {
        setMessage('Missing Supabase configuration.')
        return
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (!error) {
        onOpenChange(false)
        router.push('/app')
        return
      }
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleRegister = async () => {
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setBusy(true)

    try {
      if (!supabase) {
        setMessage('Missing Supabase configuration.')
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })
      if (!error) {
        onOpenChange(false)
        router.push('/app')
        return
      }
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-foreground border-border">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Welcome back</DialogTitle>
          <DialogDescription>
            Sign in to access your trading workspace.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="login" className="w-full">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="w-full">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <div className="space-y-3">
              <Input placeholder="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              <Input placeholder="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
              {message && <p className="text-sm text-destructive">{message}</p>}
              <Button className="w-full" onClick={handleLogin} disabled={busy}>
                {busy ? 'Working...' : 'Continue'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <div className="space-y-3">
              <Input placeholder="Name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
              <Input placeholder="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              <Input placeholder="Password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <Input
                placeholder="Confirm password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              {message && <p className="text-sm text-destructive">{message}</p>}
              <Button className="w-full" onClick={handleRegister} disabled={busy}>
                {busy ? 'Working...' : 'Create account'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
