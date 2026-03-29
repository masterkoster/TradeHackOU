'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Bar, WSStatus } from '@/types'

const WS_URL = 'wss://stream.data.alpaca.markets/v2/iex'

export function useWebSocket(onBar: (bar: Bar) => void) {
  const [status, setStatus] = useState<WSStatus>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const onBarRef = useRef(onBar)
  onBarRef.current = onBar
  const symbolRef = useRef<string>('')

  const connect = useCallback((symbol: string) => {
    wsRef.current?.close()
    symbolRef.current = symbol
    setStatus('connecting')

    const apiKey = process.env.NEXT_PUBLIC_ALPACA_API_KEY
    const apiSecret = process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY
    if (!apiKey || !apiSecret) {
      setStatus('error')
      return
    }

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'auth',
        key: apiKey,
        secret: apiSecret,
      }))
    }

    ws.onmessage = (event: MessageEvent) => {
      const messages = JSON.parse(event.data as string) as Array<Record<string, unknown>>
      for (const msg of messages) {
        if (msg['T'] === 'error') {
          setStatus('error')
        }
        if (msg['T'] === 'success' && msg['msg'] === 'authenticated') {
          setStatus('authenticated')
          ws.send(JSON.stringify({ action: 'subscribe', bars: [symbolRef.current] }))
        } else if (msg['T'] === 'b' && msg['S'] === symbolRef.current) {
          const bar: Bar = {
            time: Math.floor(new Date(msg['t'] as string).getTime() / 1000),
            open: msg['o'] as number,
            high: msg['h'] as number,
            low: msg['l'] as number,
            close: msg['c'] as number,
            volume: msg['v'] as number,
          }
          onBarRef.current(bar)
        }
      }
    }

    ws.onerror = () => setStatus('error')
    ws.onclose = () => {
      if (wsRef.current === ws) setStatus('disconnected')
    }
  }, [])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setStatus('disconnected')
  }, [])

  useEffect(() => () => { wsRef.current?.close() }, [])

  return { status, connect, disconnect }
}
