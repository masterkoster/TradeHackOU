'use client'

import { useState, useCallback, useMemo } from 'react'
import { useBars } from '@/hooks/useBars'
import { CompareChart, type StockSeries } from '@/components/compare-chart'
import type { Timeframe } from '@/types'

const STOCK_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444']

function fmt(val: number | undefined, decimals = 2) {
  if (val === undefined || isNaN(val)) return '—'
  return val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function pct(a: number, b: number) {
  if (!a || !b) return '—'
  const change = ((b - a) / a) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

function StockInput({
  index,
  color,
  loading,
  onLoad,
}: {
  index: number
  color: string
  loading: boolean
  onLoad: (symbol: string, timeframe: Timeframe) => void
}) {
  const [input, setInput] = useState(index === 0 ? 'AAPL' : 'TSLA')
  const [timeframe, setTimeframe] = useState<Timeframe>('1Day')

  const handleLoad = useCallback(async () => {
    const s = input.trim().toUpperCase()
    if (!s) return
    onLoad(s, timeframe)
  }, [input, timeframe, onLoad])

  const timeframes: Timeframe[] = ['1Day', '1Hour', '15Min', '5Min']

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
      <input
        value={input}
        onChange={(e) => setInput(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
        placeholder="Symbol…"
        className="w-24 px-2.5 py-1.5 rounded-lg bg-black border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30"
      />
      <div className="flex gap-1">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              timeframe === tf ? 'text-white' : 'text-white/30 hover:text-white/60'
            }`}
            style={timeframe === tf ? { color } : {}}
          >
            {tf}
          </button>
        ))}
      </div>
      <button
        onClick={handleLoad}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg text-black text-xs font-medium disabled:opacity-50 transition-colors shrink-0"
        style={{ background: color }}
      >
        {loading ? '…' : 'Load'}
      </button>
    </div>
  )
}

function useStockState(defaultSymbol: string, color: string) {
  const { bars, loading, load } = useBars()
  const [symbol, setSymbol] = useState(defaultSymbol)

  const handleLoad = useCallback(
    async (s: string, tf: Timeframe) => {
      setSymbol(s)
      await load(s, tf)
    },
    [load]
  )

  return { symbol, bars, loading, color, handleLoad }
}

const TABLE_ROWS = [
  { key: 'close', label: 'Last Close' },
  { key: 'open', label: 'Open' },
  { key: 'high', label: 'High (latest)' },
  { key: 'low', label: 'Low (latest)' },
  { key: 'volume', label: 'Volume' },
  { key: 'change', label: 'Change %' },
]

export default function ComparePage() {
  const stockA = useStockState('AAPL', STOCK_COLORS[0])
  const stockB = useStockState('TSLA', STOCK_COLORS[1])

  const stocks = [stockA, stockB]

  const chartSeries: StockSeries[] = useMemo(
    () =>
      stocks.map((s) => ({ symbol: s.symbol, bars: s.bars, color: s.color })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stockA.bars, stockB.bars, stockA.symbol, stockB.symbol]
  )

  const hasData = stocks.some((s) => s.bars.length > 0)

  function getRow(key: string, stock: typeof stockA) {
    const { bars } = stock
    if (bars.length === 0) return '—'
    const latest = bars[bars.length - 1]
    const first = bars[0]
    switch (key) {
      case 'close': return `$${fmt(latest.close)}`
      case 'open': return `$${fmt(latest.open)}`
      case 'high': return `$${fmt(latest.high)}`
      case 'low': return `$${fmt(latest.low)}`
      case 'volume': return fmt(latest.volume, 0)
      case 'change': return pct(first.close, latest.close)
      default: return '—'
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-white mb-4">Compare</h1>

      {/* Stock inputs */}
      <div className="flex flex-col gap-3 mb-6">
        {stocks.map((stock, i) => (
          <StockInput
            key={i}
            index={i}
            color={stock.color}
            loading={stock.loading}
            onLoad={stock.handleLoad}
          />
        ))}
      </div>

      {/* Legend */}
      {hasData && (
        <div className="flex gap-4 mb-3">
          {stocks
            .filter((s) => s.bars.length > 0)
            .map((s) => (
              <div key={s.symbol} className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded-full" style={{ background: s.color }} />
                <span className="text-xs text-white/60">{s.symbol}</span>
              </div>
            ))}
        </div>
      )}

      {/* Unified chart */}
      <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 p-4 mb-6">
        {hasData ? (
          <CompareChart series={chartSeries} />
        ) : (
          <div className="h-72 flex items-center justify-center text-white/30 text-sm">
            Load at least one symbol to see the chart
          </div>
        )}
      </div>

      {/* Comparison table */}
      {hasData && (
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-white/40 font-normal">Metric</th>
                {stocks.map((s) => (
                  <th
                    key={s.symbol}
                    className="text-right px-4 py-3 font-semibold"
                    style={{ color: s.color }}
                  >
                    {s.symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map((row, i) => (
                <tr
                  key={row.key}
                  className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                >
                  <td className="px-4 py-3 text-white/50">{row.label}</td>
                  {stocks.map((s) => (
                    <td key={s.symbol} className="px-4 py-3 text-right text-white">
                      {getRow(row.key, s)}
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
