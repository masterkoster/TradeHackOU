import { useState } from 'react'
import type { FormEvent } from 'react'
import { signIn, signUp } from '../auth/localAuth'

type Mode = 'login' | 'register'

const AuthPage = () => {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const isRegister = mode === 'register'

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')

    if (isRegister && password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    if (!email || !password) {
      setMessage('Email and password are required.')
      return
    }

    setBusy(true)

    try {
      if (isRegister) {
        signUp(email, password, name)
        setMessage('Account created. You are signed in.')
      } else {
        signIn(email, password)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.'
      setMessage(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="auth-card">
        <header className="auth-header">
          <div>
            <p className="eyebrow">TradeHackOU</p>
            <h1>Welcome</h1>
            <p className="subtle">Sign in to access your trading workspace.</p>
          </div>
        </header>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Doe"
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </label>
          {isRegister && (
            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>
          )}

          {message && <p className="auth-message">{message}</p>}

          <button className="primary" type="submit" disabled={busy}>
            {busy ? 'Working...' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthPage
