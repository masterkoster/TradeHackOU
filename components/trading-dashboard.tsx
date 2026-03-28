'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Bar, ChartType, RiskProfile, Signal, Timeframe } from '@/types'
import { useBars } from '@/hooks/useBars'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useGroqAnalysis } from '@/hooks/useGroqAnalysis'
import { analyzeSentiment } from '@/lib/sentimentClient'
import { calcSignal } from '@/lib/signal'
import { fetchNews } from '@/lib/alpacaClient'
import { Chart } from './chart'
import { Controls } from './controls'
import { StaleBanner } from './stale-banner'
import { WSStatusDot } from './ws-status-dot'
import { RiskProfileBadge } from './risk-profile'
import { HistoricAnalysis } from './historic-analysis'

interface NewsArticleRaw {
  headline: string
}

export function TradingDashboard() {
  const [symbol, setSymbol] = useState('AAPL')
  const [pendingSymbol, setPendingSymbol] = useState('AAPL')
  const [timeframe, setTimeframe] = useState<Timeframe>('1Day')
  const [chartType, setChartType] = useState<ChartType>('candlestick')
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('moderate')
  const [signal, setSignal] = useState<Signal>(null)
  const [liveBars, setLiveBars] = useState<Bar[]>([])

  const { bars, loading, error, stale, load } = useBars()
  const { analysis, status: groqStatus, error: groqError, run: runGroq, reset: resetGroq } = useGroqAnalysis()

  const handleNewBar = useCallback((bar: Bar) => {
    setLiveBars((prev) => {
      const updated = [...prev.filter((b) => b.time !== bar.time), bar]
      return updated.sort((a, b) => a.time - b.time)
    })
  }, [])

  const { status: wsStatus, connect: wsConnect, disconnect: wsDisconnect } = useWebSocket(handleNewBar)

  const allBars = liveBars.length > 0
    ? [...bars.filter((b) => !liveBars.find((lb) => lb.time === b.time)), ...liveBars].sort(
        (a, b) => a.time - b.time
      )
    : bars

  const handleLoad = useCallback(async () => {
    const sym = pendingSymbol.trim().toUpperCase()
    if (!sym) return
    setSymbol(sym)
    setLiveBars([])
    setSignal(null)
    resetGroq()
    await load(sym, timeframe)

    // Fetch news for sentiment
    try {
      const newsData = await fetchNews(sym) as { news: NewsArticleRaw[] }
      const headlines = (newsData.news ?? []).slice(0, 10).map((n) => n.headline)
      if (headlines.length > 0) {
        const results = await analyzeSentiment(headlines)
        const top = results[0]
        const label = top.label.toLowerCase() as 'positive' | 'negative' | 'neutral'
        const confidence = top.score * 100
        setSignal(calcSignal(label, confidence, riskProfile))
      }
    } catch {
      // sentiment is best-effort
    }

    wsDisconnect()
    wsConnect(sym)
  }, [pendingSymbol, timeframe, riskProfile, load, resetGroq, wsConnect, wsDisconnect])

  const handleRunGroq = useCallback(async () => {
    if (allBars.length === 0) return
    try {
      const newsData = await fetchNews(symbol) as { news: NewsArticleRaw[] }
      const headlines = (newsData.news ?? []).slice(0, 10).map((n) => n.headline)
      runGroq(symbol, allBars, timeframe, riskProfile, headlines)
    } catch {
      runGroq(symbol, allBars, timeframe, riskProfile)
    }
  }, [symbol, allBars, timeframe, riskProfile, runGroq])

  // Load default symbol on mount
  const didMount = useRef(false)
  useEffect(() => {
    if (didMount.current) return
    didMount.current = true
    load('AAPL', '1Day')
  }, [load])

  return (
    <div className="flex flex-col gap-4">
      {/* Controls row */}
      <Controls
        symbol={pendingSymbol}
        timeframe={timeframe}
        chartType={chartType}
        riskProfile={riskProfile}
        loading={loading}
        onSymbolChange={setPendingSymbol}
        onTimeframeChange={(tf) => { setTimeframe(tf); setLiveBars([]) }}
        onChartTypeChange={setChartType}
        onRiskProfileChange={setRiskProfile}
        onLoad={handleLoad}
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <WSStatusDot status={wsStatus} />
          <RiskProfileBadge signal={signal} riskProfile={riskProfile} />
        </div>
        {stale && <StaleBanner show />}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-900/20 border border-red-800/30 rounded-lg text-sm text-red-400">
          <span>{error}</span>
          <button
            onClick={handleLoad}
            className="underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Chart */}
      <div className="p-4 bg-[#0D0D0D] rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-white">
            {symbol}
            <span className="ml-2 text-sm text-gray-400">{timeframe}</span>
          </h2>
          {loading && <span className="text-xs text-gray-500 animate-pulse">Loading…</span>}
        </div>
        {allBars.length > 0 ? (
          <Chart bars={allBars} chartType={chartType} />
        ) : !loading ? (
          <div className="h-[400px] flex items-center justify-center text-gray-500 text-sm">
            Enter a symbol and click Load
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* AI Analysis panel */}
      <HistoricAnalysis
        symbol={symbol}
        timeframe={timeframe}
        status={groqStatus}
        analysis={analysis}
        error={groqError}
        onRun={handleRunGroq}
        onRetry={() => { resetGroq(); handleRunGroq() }}
      />
    </div>
  )
}
