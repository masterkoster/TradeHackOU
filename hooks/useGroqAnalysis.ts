'use client'

import { useCallback, useState } from 'react'
import type { Bar, GroqAnalysis, GroqStatus, RiskProfile, Timeframe } from '@/types'
import { analyzeHistory } from '@/lib/groqClient'

const SESSION_TTL_MS = 5 * 60 * 1000

function sessionKey(symbol: string, timeframe: Timeframe) {
  return `groq:${symbol}:${timeframe}`
}

function getSessionCached(symbol: string, timeframe: Timeframe): GroqAnalysis | null {
  try {
    const raw = sessionStorage.getItem(sessionKey(symbol, timeframe))
    if (!raw) return null
    const { analysis, savedAt } = JSON.parse(raw) as { analysis: GroqAnalysis; savedAt: number }
    if (Date.now() - savedAt > SESSION_TTL_MS) return null
    return analysis
  } catch {
    return null
  }
}

function setSessionCached(symbol: string, timeframe: Timeframe, analysis: GroqAnalysis) {
  try {
    sessionStorage.setItem(sessionKey(symbol, timeframe), JSON.stringify({ analysis, savedAt: Date.now() }))
  } catch { /* ignore */ }
}

export function useGroqAnalysis() {
  const [analysis, setAnalysis] = useState<GroqAnalysis | null>(null)
  const [status, setStatus] = useState<GroqStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (
    symbol: string,
    bars: Bar[],
    timeframe: Timeframe,
    riskProfile: RiskProfile,
    newsHeadlines?: string[]
  ) => {
    if (status === 'loading') return

    const cached = getSessionCached(symbol, timeframe)
    if (cached) {
      setAnalysis(cached)
      setStatus('done')
      return
    }

    setStatus('loading')
    setError(null)
    try {
      const result = await analyzeHistory(symbol, bars, timeframe, riskProfile, newsHeadlines)
      setSessionCached(symbol, timeframe, result)
      setAnalysis(result)
      setStatus('done')
    } catch (err) {
      setError((err as Error).message)
      setStatus('error')
    }
  }, [status])

  const reset = useCallback(() => {
    setAnalysis(null)
    setStatus('idle')
    setError(null)
  }, [])

  const hydrate = useCallback((cached: GroqAnalysis) => {
    setAnalysis(cached)
    setStatus('done')
    setError(null)
  }, [])

  return { analysis, status, error, run, reset, hydrate }
}
