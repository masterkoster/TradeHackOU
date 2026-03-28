import type { Bar, Timeframe } from '@/types'
import { getCached, setCached } from './dataCache'

const TIMEFRAME_API: Record<Timeframe, string> = {
  '1Min': '1Min',
  '5Min': '5Min',
  '15Min': '15Min',
  '1Hour': '1Hour',
  '1Day': '1Day',
  '1Week': '1Week',
  '1Month': '1Month',
}

function rawToBars(raw: Array<{ t: string; o: number; h: number; l: number; c: number; v: number }>): Bar[] {
  return raw.map((b) => ({
    time: Math.floor(new Date(b.t).getTime() / 1000),
    open: b.o,
    high: b.h,
    low: b.l,
    close: b.c,
    volume: b.v,
  }))
}

export async function fetchBars(
  symbol: string,
  timeframe: Timeframe,
  limit = 200,
  force = false
): Promise<{ bars: Bar[]; fromCache: boolean }> {
  const cached = getCached(symbol, timeframe)
  if (cached && !force) return { bars: cached.bars, fromCache: true }

  const res = await fetch(
    `/api/alpaca/bars?symbol=${encodeURIComponent(symbol)}&timeframe=${TIMEFRAME_API[timeframe]}&limit=${limit}`,
    { cache: 'no-store' }
  )
  if (res.status === 429) throw new Error('Rate limited — try again shortly')
  if (!res.ok) throw new Error('Failed to fetch bars')

  const data = await res.json()
  const bars = rawToBars(data.bars ?? [])
  setCached(symbol, timeframe, bars)
  return { bars, fromCache: false }
}

export async function fetchLatestQuote(symbol: string): Promise<unknown> {
  const res = await fetch(`/api/alpaca/quote?symbol=${encodeURIComponent(symbol)}`)
  if (!res.ok) throw new Error('Failed to fetch quote')
  return res.json()
}

export async function fetchNews(symbol: string): Promise<unknown> {
  const res = await fetch(`/api/alpaca/news?symbols=${encodeURIComponent(symbol)}`)
  if (!res.ok) throw new Error('Failed to fetch news')
  return res.json()
}
