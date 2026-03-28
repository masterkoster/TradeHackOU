'use client'

import { useState, useCallback } from 'react'
import { useBars } from '@/hooks/useBars'
import { Chart } from '@/components/chart'
import type { ChartType, Timeframe } from '@/types'

function SymbolPanel({
  label,
  defaultSymbol,
}: {
  label: 'A' | 'B'
  defaultSymbol: string
}) {
  const [input, setInput] = useState(defaultSymbol)
  const [symbol, setSymbol] = useState(defaultSymbol)
  const [timeframe, setTimeframe] = useState<Timeframe>('1Day')
  const [chartType] = useState<ChartType>('line')
  const { bars, loading, error, load } = useBars()

  const handleLoad = useCallback(async () => {
    const s = input.trim().toUpperCase()
    if (!s) return
    setSymbol(s)
    await load(s, timeframe)
  }, [input, timeframe, load])

  const timeframes: Timeframe[] = ['1Day', '1Hour', '15Min', '5Min']

  return (
    <div className="flex-1 min-w-0 p-4 rounded-2xl bg-[#0D0D0D] border border-white/10 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-white/10 text-xs font-bold text-white/60 flex items-center justify-center shrink-0">
          {label}
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
          placeholder="Symbol…"
          className="w-28 px-2.5 py-1.5 rounded-lg bg-black border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#22c55e]/50"
        />
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                timeframe === tf
                  ? 'bg-[#22c55e]/10 text-[#22c55e]'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <button
          onClick={handleLoad}
          disabled={loading}
          className="ml-auto px-3 py-1.5 rounded-lg bg-[#22c55e] text-black text-xs font-medium hover:bg-[#16a34a] disabled:opacity-50 transition-colors shrink-0"
        >
          {loading ? '…' : 'Load'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-white">{symbol}</span>
        <span className="text-sm text-white/40">{timeframe}</span>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {bars.length > 0 ? (
        <Chart bars={bars} chartType={chartType} />
      ) : !loading ? (
        <div className="h-64 flex items-center justify-center text-white/30 text-sm">
          Click Load to fetch data
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

export default function ComparePage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-white mb-6">Compare</h1>
      <p className="text-sm text-white/40 mb-6">Load two symbols to compare their charts side by side.</p>
      <div className="flex gap-4 flex-col lg:flex-row">
        <SymbolPanel label="A" defaultSymbol="AAPL" />
        <SymbolPanel label="B" defaultSymbol="TSLA" />
      </div>
    </div>
  )
}
