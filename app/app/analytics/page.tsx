'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useBars } from '@/hooks/useBars'
import { useGroqAnalysis } from '@/hooks/useGroqAnalysis'
import { analyzeSentiment } from '@/lib/sentimentClient'
import { fetchNews } from '@/lib/alpacaClient'
import { calcSignal } from '@/lib/signal'
import { HistoricAnalysis } from '@/components/historic-analysis'
import type { GroqAnalysis, Signal, Timeframe } from '@/types'
import { useRiskProfile } from '@/contexts/RiskProfileContext'

interface NewsArticleRaw {
  headline: string
}

const WATCHLIST = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'SPY']

export default function AnalyticsPage() {
  const [symbol, setSymbol] = useState('AAPL')
  const [input, setInput] = useState('AAPL')
  const { riskProfile } = useRiskProfile()
  const [signal, setSignal] = useState<Signal>(null)
  const [sentiment, setSentiment] = useState<{ label: string; score: number } | null>(null)
  const [headlines, setHeadlines] = useState<string[]>([])
  const [timeframe] = useState<Timeframe>('1Day')

  const { bars, loading, load } = useBars()
  const { analysis, status: groqStatus, error: groqError, run: runGroq, reset: resetGroq, hydrate } = useGroqAnalysis()

  const didMount = useRef(false)

  const handleAnalyze = useCallback(async (sym: string) => {
    const s = sym.trim().toUpperCase()
    if (!s) return
    setSymbol(s)
    setInput(s)
    setSignal(null)
    setSentiment(null)
    setHeadlines([])
    resetGroq()

    await load(s, timeframe)

    try {
      const newsData = await fetchNews(s) as { news: NewsArticleRaw[] }
      const h = (newsData.news ?? []).slice(0, 10).map((n) => n.headline)
      setHeadlines(h)
      if (h.length > 0) {
        const results = await analyzeSentiment(h)
        const top = results[0]
        const label = top.label.toLowerCase() as 'positive' | 'negative' | 'neutral'
        const confidence = top.score * 100
        setSentiment({ label, score: confidence })
        setSignal(calcSignal(label, confidence, riskProfile))
      }
    } catch {
      // best-effort
    }
  }, [timeframe, riskProfile, load, resetGroq])

  const handleRunGroq = useCallback(async () => {
    if (bars.length === 0) return
    runGroq(symbol, bars, timeframe, riskProfile, headlines)
  }, [symbol, bars, timeframe, riskProfile, headlines, runGroq])

  useEffect(() => {
    if (didMount.current) return
    didMount.current = true

    const key = 'analytics:AAPL:1Day'
    const cachedRaw = localStorage.getItem(key)
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw) as { savedAt: number; analysis: GroqAnalysis }
        const oneDayMs = 24 * 60 * 60 * 1000
        if (Date.now() - cached.savedAt < oneDayMs) {
          hydrate(cached.analysis)
          setSymbol('AAPL')
          setInput('AAPL')
          return
        }
      } catch {
        // ignore cache errors
      }
    }

    handleAnalyze('AAPL')
  }, [handleAnalyze, hydrate])

  useEffect(() => {
    if (!analysis) return
    try {
      const key = `analytics:${symbol}:${timeframe}`
      localStorage.setItem(
        key,
        JSON.stringify({ analysis, savedAt: Date.now() })
      )
    } catch {
      // ignore cache errors
    }
  }, [analysis, symbol, timeframe])

  const signalColors: Record<NonNullable<Signal>, string> = {
    BUY: 'bg-green-900/40 border-green-600/50 text-green-300',
    SELL: 'bg-red-900/40 border-red-600/50 text-red-300',
    HOLD: 'bg-yellow-900/40 border-yellow-600/50 text-yellow-300',
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-semibold text-white mb-6">Analytics</h1>

      {/* Quick-pick watchlist */}
      <div className="flex flex-wrap gap-2 mb-6">
        {WATCHLIST.map((t) => (
          <button
            key={t}
            onClick={() => handleAnalyze(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              symbol === t
                ? 'bg-[#22c55e]/10 border-[#22c55e]/50 text-[#22c55e]'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Symbol search */}
      <div className="flex gap-2 mb-8">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(input)}
          placeholder="Enter symbol…"
          className="flex-1 max-w-xs px-3 py-2 rounded-lg bg-[#0D0D0D] border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#22c55e]/50"
        />
        <button
          onClick={() => handleAnalyze(input)}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-[#22c55e] text-black text-sm font-medium hover:bg-[#16a34a] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading…' : 'Analyze'}
        </button>
      </div>

      {/* Sentiment + signal summary */}
      {sentiment && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/10">
            <p className="text-xs text-white/40 mb-1">Symbol</p>
            <p className="text-2xl font-bold text-white">{symbol}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/10">
            <p className="text-xs text-white/40 mb-1">Sentiment</p>
            <p className="text-2xl font-bold capitalize text-white">{sentiment.label}</p>
            <p className="text-xs text-white/40 mt-1">{sentiment.score.toFixed(1)}% confidence</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0D0D0D] border border-white/10">
            <p className="text-xs text-white/40 mb-2">Signal</p>
            {signal ? (
              <span className={`px-3 py-1 rounded border text-sm font-bold ${signalColors[signal]}`}>
                {signal}
              </span>
            ) : (
              <span className="text-white/30 text-sm">—</span>
            )}
          </div>
        </div>
      )}

      {/* Recent headlines */}
      {headlines.length > 0 && (
        <div className="mb-8 p-4 rounded-xl bg-[#0D0D0D] border border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-wide mb-3">Recent Headlines</p>
          <ul className="flex flex-col gap-2">
            {headlines.map((h, i) => (
              <li key={i} className="text-sm text-white/70 leading-snug border-l-2 border-white/10 pl-3">
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Analysis */}
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
