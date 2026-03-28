import type { Bar, CacheEntry, Timeframe } from '@/types'

const CACHE_TTL_MS = 5 * 60 * 1000
const cache = new Map<string, CacheEntry>()

function key(symbol: string, timeframe: Timeframe) {
  return `${symbol}:${timeframe}`
}

export function getCached(symbol: string, timeframe: Timeframe): CacheEntry | null {
  const entry = cache.get(key(symbol, timeframe))
  if (!entry) return null
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
    cache.delete(key(symbol, timeframe))
    return null
  }
  return entry
}

export function setCached(symbol: string, timeframe: Timeframe, bars: Bar[]): void {
  cache.set(key(symbol, timeframe), { bars, fetchedAt: Date.now(), symbol, timeframe })
}

export function isCacheStale(symbol: string, timeframe: Timeframe): boolean {
  const entry = cache.get(key(symbol, timeframe))
  if (!entry) return false
  return Date.now() - entry.fetchedAt > CACHE_TTL_MS
}
