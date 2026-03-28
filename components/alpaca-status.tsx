"use client"

import { useEffect, useState } from 'react'

type StatusState = {
  state: 'idle' | 'loading' | 'ok' | 'error'
  message: string
}

export function AlpacaStatus() {
  const [status, setStatus] = useState<StatusState>({
    state: 'idle',
    message: 'Not checked',
  })

  useEffect(() => {
    let active = true

    const run = async () => {
      if (!active) {
        return
      }

      setStatus({ state: 'loading', message: 'Checking connection...' })

      try {
        const response = await fetch('/api/alpaca/account', {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Connection failed')
        }

        if (!active) {
          return
        }

        setStatus({ state: 'ok', message: 'Connected' })
      } catch {
        if (!active) {
          return
        }

        setStatus({ state: 'error', message: 'Not connected' })
      }
    }

    run()

    return () => {
      active = false
    }
  }, [])

  const dotColor =
    status.state === 'ok'
      ? 'bg-[#86efac]'
      : status.state === 'error'
        ? 'bg-[#f87171]'
        : 'bg-[#facc15]'

  return (
    <div className="flex items-center justify-end gap-2 mt-4">
      <div className={`w-[13px] h-[13px] rounded-full ${dotColor}`} />
      <span className="text-sm text-[#919191]">Alpaca: {status.message}</span>
    </div>
  )
}
