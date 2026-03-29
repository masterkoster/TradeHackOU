'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Bar, ChartType, Signal, Timeframe, VisualizationMode } from '@/types'
import { useRiskProfile } from '@/contexts/RiskProfileContext'
import { useBars } from '@/hooks/useBars'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useGroqAnalysis } from '@/hooks/useGroqAnalysis'
import { analyzeSentiment } from '@/lib/sentimentClient'
import { calcSignal } from '@/lib/signal'
import { fetchBars, fetchNews } from '@/lib/alpacaClient'
import { Chart } from './chart'
import { CompareChart, type StockSeries } from './compare-chart'
import { Controls } from './controls'
import { StaleBanner } from './stale-banner'
import { WSStatusDot } from './ws-status-dot'
import { RiskProfileBadge } from './risk-profile'
import { HistoricAnalysis } from './historic-analysis'
import { StarButton } from './star-button'
import { sma, toReturnsSeries, vwap } from '@/lib/indicators'

interface NewsArticleRaw {
  headline: string
}

interface MarketClock {
  is_open: boolean
  next_open: string
  next_close: string
  timestamp: string
}

export function TradingDashboard() {
  const [symbol, setSymbol] = useState('AAPL')
  const [pendingSymbol, setPendingSymbol] = useState('AAPL')
  const [timeframe, setTimeframe] = useState<Timeframe>('1Day')
  const [chartType, setChartType] = useState<ChartType>('candlestick')
  const [visualization, setVisualization] = useState<VisualizationMode>('standard')
  const [multiSymbols, setMultiSymbols] = useState('AAPL,QQQ')
  const [multiSeries, setMultiSeries] = useState<StockSeries[]>([])
  const { riskProfile, setRiskProfile } = useRiskProfile()
  const [signal, setSignal] = useState<Signal>(null)
  const [liveBars, setLiveBars] = useState<Bar[]>([])
  const [marketOpen, setMarketOpen] = useState<boolean | null>(null)
  const [marketLabel, setMarketLabel] = useState<string>('Closed')

  const { bars, loading, error, stale, load, refresh } = useBars()
  const { analysis, status: groqStatus, error: groqError, run: runGroq, reset: resetGroq } = useGroqAnalysis()

  const handleNewBar = useCallback((bar: Bar) => {
    setLiveBars((prev) => {
      const updated = [...prev.filter((b) => b.time !== bar.time), bar]
      return updated.sort((a, b) => a.time - b.time)
    })
  }, [])

  const { status: wsStatus, connect: wsConnect, disconnect: wsDisconnect } = useWebSocket(handleNewBar)
  const lastRequestRef = useRef<{ symbol: string; timeframe: Timeframe } | null>(null)

  const allBars = liveBars.length > 0
    ? [...bars.filter((b) => !liveBars.find((lb) => lb.time === b.time)), ...liveBars].sort(
        (a, b) => a.time - b.time
      )
    : bars

  const returnsSeries = visualization === 'returns' ? toReturnsSeries(allBars) : []
  const overlays = {
    ma20: visualization === 'moving-averages' ? sma(allBars, 20) : undefined,
    ma50: visualization === 'moving-averages' ? sma(allBars, 50) : undefined,
    vwap: visualization === 'vwap' ? vwap(allBars) : undefined,
  }

  const multiColors = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4']

  const loadMultiSymbols = useCallback(async () => {
    const symbols = multiSymbols
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, multiColors.length)

    if (symbols.length === 0) {
      setMultiSeries([])
      return
    }

    const results = await Promise.all(
      symbols.map(async (sym, index) => {
        try {
          const { bars: seriesBars } = await fetchBars(sym, timeframe, 200, true)
          return { symbol: sym, bars: seriesBars, color: multiColors[index] }
        } catch {
          return { symbol: sym, bars: [], color: multiColors[index] }
        }
      })
    )

    setMultiSeries(results)
  }, [multiSymbols, timeframe])

  const fetchMarketStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/alpaca/clock')
      if (!res.ok) return
      const data = (await res.json()) as MarketClock
      if (typeof data.is_open === 'boolean') {
        setMarketOpen(data.is_open)
      }

      const now = new Date(data.timestamp)
      const next = new Date(data.is_open ? data.next_close : data.next_open)
      const diffMs = Math.max(0, next.getTime() - now.getTime())
      const totalMinutes = Math.floor(diffMs / 60000)
      const days = Math.floor(totalMinutes / 1440)
      const hours = Math.floor((totalMinutes % 1440) / 60)
      const minutes = totalMinutes % 60

      const parts: string[] = []
      if (days > 0) parts.push(`${days}d`)
      if (hours > 0 || days > 0) parts.push(`${hours}h`)
      parts.push(`${minutes}m`)

      setMarketLabel(data.is_open ? `Open · closes in ${parts.join(' ')}` : `Closed · opens in ${parts.join(' ')}`)
    } catch {
      // ignore market status errors
    }
  }, [])

  const handleLoad = useCallback(async () => {
    const sym = pendingSymbol.trim().toUpperCase()
    if (!sym) return
    setSymbol(sym)
    setLiveBars([])
    setSignal(null)
    resetGroq()
    await load(sym, timeframe)
    lastRequestRef.current = { symbol: sym, timeframe }
    fetchMarketStatus()

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
    wsDisconnect()
    wsConnect(sym)
  }, [pendingSymbol, timeframe, riskProfile, load, resetGroq, wsConnect, wsDisconnect, fetchMarketStatus])

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
    lastRequestRef.current = { symbol: 'AAPL', timeframe: '1Day' }
    fetchMarketStatus()
    wsConnect('AAPL')
  }, [load, fetchMarketStatus])

  useEffect(() => {
    if (!lastRequestRef.current) return
    const { symbol: activeSymbol } = lastRequestRef.current
    setLiveBars([])
    load(activeSymbol, timeframe)
    lastRequestRef.current = { symbol: activeSymbol, timeframe }
    wsDisconnect()
    wsConnect(activeSymbol)
  }, [timeframe, load, wsConnect, wsDisconnect])

  useEffect(() => {
    if (visualization === 'multi') {
      loadMultiSymbols()
    }
  }, [visualization, loadMultiSymbols])

  useEffect(() => {
    const id = setInterval(() => {
      const last = lastRequestRef.current
      if (!last) return
      refresh(last.symbol, last.timeframe)
    }, 60_000)

    return () => clearInterval(id)
  }, [refresh])

  useEffect(() => {
    fetchMarketStatus()
    const id = setInterval(fetchMarketStatus, 60_000)
    return () => clearInterval(id)
  }, [fetchMarketStatus])

  return (
    <div className="flex flex-col gap-4">
      {/* Controls row */}
      <Controls
        symbol={pendingSymbol}
        timeframe={timeframe}
        chartType={chartType}
        visualization={visualization}
        riskProfile={riskProfile}
        loading={loading}
        onSymbolChange={setPendingSymbol}
        onTimeframeChange={(tf) => { setTimeframe(tf); setLiveBars([]) }}
        onChartTypeChange={setChartType}
        onVisualizationChange={setVisualization}
        onRiskProfileChange={setRiskProfile}
        onLoad={handleLoad}
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <WSStatusDot status={wsStatus} />
          <RiskProfileBadge
            signal={signal}
            riskProfile={riskProfile}
            marketOpen={marketOpen ?? false}
            marketLabel={marketLabel}
          />
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
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium text-white">
              {symbol}
              <span className="ml-2 text-sm text-gray-400">{timeframe}</span>
            </h2>
            <StarButton symbol={symbol} size={16} />
          </div>
          {loading && <span className="text-xs text-gray-500 animate-pulse">Loading…</span>}
        </div>
        {allBars.length > 0 ? (
          visualization === 'multi' ? (
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <input
                  value={multiSymbols}
                  onChange={(e) => setMultiSymbols(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadMultiSymbols()}
                  placeholder="AAPL, QQQ, MSFT"
                  className="w-64 px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#333] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#555]"
                />
                <button
                  onClick={loadMultiSymbols}
                  className="px-3 py-1.5 rounded-lg bg-[#22c55e] text-black text-xs font-medium hover:bg-[#16a34a]"
                >
                  Apply
                </button>
              </div>
              <CompareChart series={multiSeries.filter((s) => s.bars.length > 0)} />
            </div>
          ) : (
            <Chart
              bars={allBars}
              chartType={chartType}
              overlays={overlays}
              mode={visualization === 'volume' ? 'volume' : visualization === 'returns' ? 'returns' : 'standard'}
              returns={returnsSeries}
            />
          )
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
