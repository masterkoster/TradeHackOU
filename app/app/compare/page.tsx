'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { CompareChart, type StockSeries } from '@/components/compare-chart'
import { fetchBarsForPeriod } from '@/lib/alpacaClient'
import { StarButton } from '@/components/star-button'
import type { Bar, Timeframe } from '@/types'

// ─── Period config ────────────────────────────────────────────────────────────

const PERIODS = [
  { key: '1D', label: '1D', days: 1, timeframe: '5Min' as Timeframe, limit: 100 },
  { key: '1W', label: '1W', days: 7, timeframe: '1Hour' as Timeframe, limit: 50 },
  { key: '1M', label: '1M', days: 30, timeframe: '1Day' as Timeframe, limit: 23 },
  { key: '3M', label: '3M', days: 90, timeframe: '1Day' as Timeframe, limit: 66 },
  { key: '1Y', label: '1Y', days: 365, timeframe: '1Day' as Timeframe, limit: 252 },
]

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4']

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stock {
  id: number
  symbol: string
  bars: Bar[]
  loading: boolean
  error: string | null
  color: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(val: number | undefined, dec = 2) {
  if (val === undefined || isNaN(val)) return '—'
  return val.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function pct(a: number, b: number) {
  if (!a || !b) return '—'
  const c = ((b - a) / a) * 100
  return `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`
}

const TABLE_ROWS = [
  { key: 'close', label: 'Last Close' },
  { key: 'open', label: 'Open' },
  { key: 'high', label: 'High' },
  { key: 'low', label: 'Low' },
  { key: 'volume', label: 'Volume' },
  { key: 'change', label: 'Period Change' },
]

function getCell(key: string, bars: Bar[]): string {
  if (bars.length === 0) return '—'
  const latest = bars[bars.length - 1]
  const first = bars[0]
  switch (key) {
    case 'close':
      return `$${fmt(latest.close)}`
    case 'open':
      return `$${fmt(latest.open)}`
    case 'high':
      return `$${fmt(latest.high)}`
    case 'low':
      return `$${fmt(latest.low)}`
    case 'volume':
      return fmt(latest.volume, 0)
    case 'change':
      return pct(first.close, latest.close)
    default:
      return '—'
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

let nextId = 3
const INITIAL: Stock[] = [
  { id: 1, symbol: 'AAPL', bars: [], loading: false, error: null, color: COLORS[0] },
  { id: 2, symbol: 'TSLA', bars: [], loading: false, error: null, color: COLORS[1] },
]

export default function ComparePage() {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL)
  const [period, setPeriod] = useState(PERIODS[2]) // default 1M
  const [inputs, setInputs] = useState<Record<number, string>>({ 1: 'AAPL', 2: 'TSLA' })
  const loadingRef = useRef<Set<number>>(new Set())

  const loadStock = useCallback(
    async (id: number, symbol: string, p = period) => {
      const s = symbol.trim().toUpperCase()
      if (!s) return
      if (loadingRef.current.has(id)) return

      loadingRef.current.add(id)
      setStocks((prev) =>
        prev.map((st) => (st.id === id ? { ...st, symbol: s, loading: true, error: null } : st))
      )

      const startIso = new Date(Date.now() - p.days * 24 * 60 * 60 * 1000).toISOString()
      try {
        const bars = await fetchBarsForPeriod(s, p.timeframe, startIso, p.limit)
        setStocks((prev) => prev.map((st) => (st.id === id ? { ...st, bars, loading: false } : st)))
      } catch (err) {
        setStocks((prev) =>
          prev.map((st) =>
            st.id === id ? { ...st, bars: [], loading: false, error: (err as Error).message } : st
          )
        )
      } finally {
        loadingRef.current.delete(id)
      }
    },
    [period]
  )

  const changePeriod = useCallback((p: (typeof PERIODS)[number]) => {
    setPeriod(p)
    setStocks((prev) => {
      prev.forEach((st) => {
        if (st.symbol) loadStock(st.id, st.symbol, p)
      })
      return prev
    })
  }, [loadStock])

  const addStock = useCallback(() => {
    const id = nextId++
    const color = COLORS[stocks.length % COLORS.length]
    setStocks((prev) => [...prev, { id, symbol: '', bars: [], loading: false, error: null, color }])
    setInputs((prev) => ({ ...prev, [id]: '' }))
  }, [stocks.length])

  const removeStock = useCallback((id: number) => {
    setStocks((prev) => prev.filter((s) => s.id !== id))
    setInputs((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const chartSeries: StockSeries[] = useMemo(
    () => stocks.map((s) => ({ symbol: s.symbol, bars: s.bars, color: s.color })),
    [stocks]
  )

  const hasData = stocks.some((s) => s.bars.length > 0)

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground mb-5">Compare</h1>

      <div className="flex flex-col gap-2 mb-5">
        {stocks.map((stock) => (
          <div key={stock.id} className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: stock.color }} />

            <input
              value={inputs[stock.id] ?? ''}
              onChange={(e) => setInputs((prev) => ({ ...prev, [stock.id]: e.target.value.toUpperCase() }))}
              onKeyDown={(e) => e.key === 'Enter' && loadStock(stock.id, inputs[stock.id] ?? '')}
              placeholder="Symbol…"
              className="w-24 px-2.5 py-1.5 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/20"
            />

            <button
              onClick={() => loadStock(stock.id, inputs[stock.id] ?? '')}
              disabled={stock.loading}
              className="px-3 py-1.5 rounded-lg text-black text-xs font-medium disabled:opacity-50 transition-opacity shrink-0"
              style={{ background: stock.color }}
            >
              {stock.loading ? '…' : 'Load'}
            </button>

            {stock.bars.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium" style={{ color: stock.color }}>
                  {stock.symbol}
                </span>
                <StarButton symbol={stock.symbol} size={12} />
              </div>
            )}
            {stock.error && <span className="text-xs text-red-500 dark:text-red-400">{stock.error}</span>}

            {stocks.length > 1 && (
              <button
                onClick={() => removeStock(stock.id)}
                className="ml-auto text-muted-foreground/40 hover:text-muted-foreground transition-colors text-lg leading-none shrink-0"
                aria-label="Remove"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {stocks.length < COLORS.length && (
          <button
            onClick={addStock}
            className="self-start mt-1 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 text-xs transition-colors"
          >
            + Add stock
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-4">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => changePeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              period.key === p.key
                ? 'bg-foreground/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {hasData && (
        <div className="flex gap-4 mb-3 flex-wrap">
          {stocks.filter((s) => s.bars.length > 0).map((s) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 rounded-full" style={{ background: s.color }} />
              <span className="text-xs" style={{ color: s.color }}>
                {s.symbol}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-card border border-border p-4 mb-6">
        {hasData ? (
          <CompareChart series={chartSeries} />
        ) : (
          <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
            Load at least one symbol to see the chart
          </div>
        )}
      </div>

      {hasData && (
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-muted-foreground font-normal">Metric</th>
                {stocks.map((s) => (
                  <th key={s.id} className="text-right px-4 py-3 font-semibold" style={{ color: s.color }}>
                    {s.symbol || '—'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map((row, i) => (
                <tr
                  key={row.key}
                  className={`border-b border-border/50 ${i % 2 !== 0 ? 'bg-muted/30' : ''}`}
                >
                  <td className="px-4 py-3 text-muted-foreground">{row.label}</td>
                  {stocks.map((s) => (
                    <td key={s.id} className="px-4 py-3 text-right text-foreground tabular-nums">
                      {getCell(row.key, s.bars)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
