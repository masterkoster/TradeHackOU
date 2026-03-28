'use client'

import type { ChartType, RiskProfile, Timeframe } from '@/types'

interface ControlsProps {
  symbol: string
  timeframe: Timeframe
  chartType: ChartType
  riskProfile: RiskProfile
  loading: boolean
  onSymbolChange: (s: string) => void
  onTimeframeChange: (t: Timeframe) => void
  onChartTypeChange: (c: ChartType) => void
  onRiskProfileChange: (r: RiskProfile) => void
  onLoad: () => void
}

const TIMEFRAMES: Timeframe[] = ['1Min', '5Min', '15Min', '1Hour', '1Day', '1Week', '1Month']
const CHART_TYPES: ChartType[] = ['candlestick', 'line', 'area', 'ohlc', 'heikin-ashi']
const RISK_PROFILES: RiskProfile[] = ['low', 'moderate', 'high']

export function Controls({
  symbol,
  timeframe,
  chartType,
  riskProfile,
  loading,
  onSymbolChange,
  onTimeframeChange,
  onChartTypeChange,
  onRiskProfileChange,
  onLoad,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-[#0D0D0D] rounded-2xl">
      {/* Symbol */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={symbol}
          onChange={(e) => onSymbolChange(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && onLoad()}
          placeholder="Symbol"
          className="w-24 px-3 py-1.5 bg-[#1A1A1A] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#555] uppercase"
        />
      </div>

      {/* Timeframe */}
      <div className="flex items-center bg-[#1A1A1A] rounded-lg p-1">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              timeframe === tf
                ? 'bg-[#2A2A2A] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Chart type */}
      <div className="flex items-center bg-[#1A1A1A] rounded-lg p-1">
        {CHART_TYPES.map((ct) => (
          <button
            key={ct}
            onClick={() => onChartTypeChange(ct)}
            className={`px-2 py-1 text-xs rounded-md transition-colors capitalize ${
              chartType === ct
                ? 'bg-[#2A2A2A] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {ct === 'heikin-ashi' ? 'HA' : ct}
          </button>
        ))}
      </div>

      {/* Risk profile */}
      <div className="flex items-center bg-[#1A1A1A] rounded-lg p-1">
        {RISK_PROFILES.map((rp) => (
          <button
            key={rp}
            onClick={() => onRiskProfileChange(rp)}
            className={`px-2 py-1 text-xs rounded-md transition-colors capitalize ${
              riskProfile === rp
                ? rp === 'low'
                  ? 'bg-green-900/60 text-green-300 shadow-sm'
                  : rp === 'moderate'
                  ? 'bg-yellow-900/60 text-yellow-300 shadow-sm'
                  : 'bg-red-900/60 text-red-300 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {rp}
          </button>
        ))}
      </div>

      {/* Load button */}
      <button
        onClick={onLoad}
        disabled={loading || !symbol}
        className="px-4 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? 'Loading…' : 'Load'}
      </button>
    </div>
  )
}
