'use client'

import { useCallback, useState } from 'react'
import type { Bar, Timeframe } from '@/types'
import { fetchBars } from '@/lib/alpacaClient'
import { getCached } from '@/lib/dataCache'

interface State {
  bars: Bar[]
  loading: boolean
  error: string | null
  stale: boolean
}

export function useBars() {
  const [state, setState] = useState<State>({
    bars: [],
    loading: false,
    error: null,
    stale: false,
  })

  const load = useCallback(async (symbol: string, timeframe: Timeframe) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const { bars, fromCache } = await fetchBars(symbol, timeframe)
      setState({ bars, loading: false, error: null, stale: fromCache })
    } catch (err) {
      const cached = getCached(symbol, timeframe)
      if (cached) {
        setState({ bars: cached.bars, loading: false, error: null, stale: true })
      } else {
        setState({ bars: [], loading: false, error: (err as Error).message, stale: false })
      }
    }
  }, [])

  const refresh = useCallback(async (symbol: string, timeframe: Timeframe) => {
    try {
      const { bars, fromCache } = await fetchBars(symbol, timeframe, 200, true)
      setState({ bars, loading: false, error: null, stale: fromCache })
    } catch (err) {
      const cached = getCached(symbol, timeframe)
      if (cached) {
        setState({ bars: cached.bars, loading: false, error: null, stale: true })
      } else {
        setState({ bars: [], loading: false, error: (err as Error).message, stale: false })
      }
    }
  }, [])

  return { ...state, load, refresh }
}
