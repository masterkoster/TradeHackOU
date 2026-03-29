'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Minus, Star } from 'lucide-react'
import { useFavorites } from '@/contexts/FavoritesContext'
import { StarButton } from '@/components/star-button'
import { CompareChart, type StockSeries } from '@/components/compare-chart'
import { fetchBarsForPeriod } from '@/lib/alpacaClient'
import type { Bar, Timeframe } from '@/types'

// ─── Colors (matches compare page) ───────────────────────────────────────────
const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4', '#f43f5e', '#84cc16']

// ─── Types ────────────────────────────────────────────────────────────────────
interface SnapData {
  symbol: string
  price: number
  changePct: number
  volume: number
}

interface PortfolioAnalysis {
  outlook: string
  thesis: string
  strongestPicks: string[]
  weakestPicks: string[]
  concentration: string
  plan: string
  risks: string
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatVolume(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

const SENTIMENT_STYLES: Record<string, string> = {
  bullish: 'text-[#22c55e] bg-[#22c55e]/10',
  bearish: 'text-red-500 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
  neutral: 'text-muted-foreground bg-muted',
  mixed:   'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/10',
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FavoritesPage() {
  const { favorites } = useFavorites()

  const [snaps, setSnaps]         = useState<Record<string, SnapData>>({})
  const [snapsLoading, setSnapsLoading] = useState(false)
  const [snapsError, setSnapsError]   = useState<string | null>(null)

  const [chartBars, setChartBars]   = useState<Record<string, Bar[]>>({})
  const [chartLoading, setChartLoading] = useState(false)

  const [analysis, setAnalysis]     = useState<PortfolioAnalysis | null>(null)
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [analysisError, setAnalysisError]   = useState<string | null>(null)

  // ── Fetch snapshots ──────────────────────────────────────────────────────
  const fetchSnaps = useCallback(async (syms: string[]) => {
    if (syms.length === 0) { setSnaps({}); return }
    setSnapsLoading(true)
    setSnapsError(null)
    try {
      const res = await fetch(`/api/alpaca/snapshots?symbols=${syms.join(',')}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as Record<string, {
        latestTrade?: { p?: number }
        dailyBar?: { o?: number; c?: number; v?: number }
        prevDailyBar?: { c?: number }
      }>
      const parsed: Record<string, SnapData> = {}
      syms.forEach((sym) => {
        const s = data[sym]
        if (!s) return
        const price = s.latestTrade?.p ?? s.dailyBar?.c ?? 0
        const prev  = s.prevDailyBar?.c ?? s.dailyBar?.o ?? 0
        parsed[sym] = {
          symbol: sym,
          price,
          changePct: prev > 0 ? ((price - prev) / prev) * 100 : 0,
          volume: s.dailyBar?.v ?? 0,
        }
      })
      setSnaps(parsed)
    } catch (err) {
      setSnapsError(err instanceof Error ? err.message : 'Failed to load prices')
    } finally {
      setSnapsLoading(false)
    }
  }, [])

  // ── Fetch chart bars (1M, daily) for all favorites ───────────────────────
  const fetchChartBars = useCallback(async (syms: string[]) => {
    if (syms.length === 0) { setChartBars({}); return }
    setChartLoading(true)
    const startIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const results = await Promise.allSettled(
      syms.map((sym) => fetchBarsForPeriod(sym, '1Day' as Timeframe, startIso, 23))
    )
    const next: Record<string, Bar[]> = {}
    syms.forEach((sym, i) => {
      const r = results[i]
      if (r.status === 'fulfilled') next[sym] = r.value
    })
    setChartBars(next)
    setChartLoading(false)
  }, [])

  // ── Run portfolio analysis ────────────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    if (favorites.length === 0) return
    const snapList = favorites.map((sym) => snaps[sym]).filter(Boolean) as SnapData[]
    if (snapList.length === 0) return

    setAnalysisStatus('loading')
    setAnalysisError(null)
    try {
      const res = await fetch('/api/groq/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: favorites, snaps: snapList }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { content } = await res.json() as { content: string }
      const parsed = JSON.parse(content) as PortfolioAnalysis
      setAnalysis(parsed)
      setAnalysisStatus('done')
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed')
      setAnalysisStatus('error')
    }
  }, [favorites, snaps])

  // ── Load on favorites change ──────────────────────────────────────────────
  useEffect(() => {
    fetchSnaps(favorites)
    fetchChartBars(favorites)
    setAnalysis(null)
    setAnalysisStatus('idle')
  }, [favorites, fetchSnaps, fetchChartBars])

  // ── Chart series ──────────────────────────────────────────────────────────
  const chartSeries: StockSeries[] = useMemo(
    () =>
      favorites.map((sym, i) => ({
        symbol: sym,
        bars: chartBars[sym] ?? [],
        color: COLORS[i % COLORS.length],
      })),
    [favorites, chartBars]
  )

  const hasChart = chartSeries.some((s) => s.bars.length > 0)

  // ── Empty state ───────────────────────────────────────────────────────────
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <Star size={40} className="text-muted-foreground/30" />
        <p className="text-muted-foreground text-sm max-w-xs">
          No favorites yet. Click the star icon on any stock to add it here.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Favorites</h1>
        <button
          onClick={() => { fetchSnaps(favorites); fetchChartBars(favorites) }}
          disabled={snapsLoading || chartLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={12} className={snapsLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {snapsError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-600 text-sm dark:bg-red-900/20 dark:border-red-600/30 dark:text-red-300">
          {snapsError}
        </div>
      )}

      {/* Stock list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {favorites.map((sym, i) => {
          const snap = snaps[sym]
          const color = COLORS[i % COLORS.length]
          const positive = (snap?.changePct ?? 0) >= 0
          return (
            <div
              key={sym}
              className="p-4 rounded-xl bg-card border border-border flex items-center gap-3"
            >
              <span className="w-2 h-8 rounded-full shrink-0" style={{ background: color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-bold text-foreground">{sym}</p>
                  <StarButton symbol={sym} size={12} />
                </div>
                {snap ? (
                  <>
                    <p className="text-base font-semibold text-foreground">${snap.price.toFixed(2)}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {positive
                        ? <TrendingUp size={11} className="text-[#22c55e]" />
                        : <TrendingDown size={11} className="text-red-500 dark:text-red-400" />}
                      <span className={`text-xs font-medium ${positive ? 'text-[#22c55e]' : 'text-red-500 dark:text-red-400'}`}>
                        {positive ? '+' : ''}{snap.changePct.toFixed(2)}%
                      </span>
                      {snap.volume > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">· {formatVolume(snap.volume)}</span>
                      )}
                    </div>
                  </>
                ) : snapsLoading ? (
                  <div className="h-4 w-16 bg-muted-foreground/20 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-xs text-muted-foreground">No data</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Compare chart */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">30-Day Performance</p>
        <div className="rounded-2xl bg-card border border-border p-4">
          {/* Legend */}
          {hasChart && (
            <div className="flex gap-4 flex-wrap mb-3">
              {chartSeries.filter((s) => s.bars.length > 0).map((s) => (
                <div key={s.symbol} className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs" style={{ color: s.color }}>{s.symbol}</span>
                </div>
              ))}
            </div>
          )}
          {chartLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : hasChart ? (
            <CompareChart series={chartSeries} />
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
              Chart data unavailable
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Analysis */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Market Outlook &amp; Plan</p>
          {analysisStatus !== 'loading' && (
            <button
              onClick={runAnalysis}
              disabled={Object.keys(snaps).length === 0}
              className="px-3 py-1.5 rounded-lg bg-[#22c55e] text-black text-xs font-medium hover:bg-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {analysisStatus === 'done' ? 'Regenerate' : 'Analyze Watchlist'}
            </button>
          )}
        </div>

        {analysisStatus === 'idle' && (
          <div className="rounded-2xl bg-card border border-border p-6 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Click &quot;Analyze Watchlist&quot; to get an AI-generated market outlook based on your favorites.</p>
          </div>
        )}

        {analysisStatus === 'loading' && (
          <div className="rounded-2xl bg-card border border-border p-6 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Analyzing your watchlist…</p>
          </div>
        )}

        {analysisStatus === 'error' && (
          <div className="rounded-2xl bg-red-50 border border-red-300 p-4 text-red-600 text-sm flex items-center justify-between gap-4 dark:bg-red-900/20 dark:border-red-600/30 dark:text-red-300">
            <span>{analysisError}</span>
            <button onClick={runAnalysis} className="underline hover:no-underline shrink-0">Retry</button>
          </div>
        )}

        {analysisStatus === 'done' && analysis && (
          <div className="rounded-2xl bg-card border border-border divide-y divide-border">
            {/* Header row */}
            <div className="p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${SENTIMENT_STYLES[analysis.sentiment] ?? SENTIMENT_STYLES.neutral}`}>
                    {analysis.sentiment}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{analysis.outlook}</p>
              </div>
            </div>

            {/* Thesis */}
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Your Market Thesis</p>
              <p className="text-sm text-foreground/80">{analysis.thesis}</p>
            </div>

            {/* Strongest / Weakest */}
            <div className="px-5 py-4 grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={12} className="text-[#22c55e]" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Strongest</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.strongestPicks.map((sym) => (
                    <span key={sym} className="text-xs font-semibold px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e]">{sym}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingDown size={12} className="text-red-500 dark:text-red-400" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Weakest</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.weakestPicks.map((sym) => (
                    <span key={sym} className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">{sym}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Concentration risk */}
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Concentration Risk</p>
              <p className="text-sm text-foreground/80">{analysis.concentration}</p>
            </div>

            {/* Trading plan */}
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Trading Plan</p>
              <div className="space-y-1.5">
                {analysis.plan.split('\n').filter(Boolean).map((line, i) => (
                  <div key={i} className="flex gap-2 text-sm text-foreground/80">
                    <span className="text-[#22c55e] shrink-0">›</span>
                    <span>{line.replace(/^[•\-\d.]+\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk factors */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Minus size={12} className="text-yellow-600 dark:text-yellow-400" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Key Risks</p>
              </div>
              <p className="text-sm text-foreground/80">{analysis.risks}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
