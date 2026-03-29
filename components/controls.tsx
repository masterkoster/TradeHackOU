'use client'

import type { ChartType, RiskProfile, Timeframe, VisualizationMode } from '@/types'

interface ControlsProps {
  symbol: string
  timeframe: Timeframe
  chartType: ChartType
  visualization: VisualizationMode
  riskProfile: RiskProfile
  loading: boolean
  onSymbolChange: (s: string) => void
  onTimeframeChange: (t: Timeframe) => void
  onChartTypeChange: (c: ChartType) => void
  onVisualizationChange: (v: VisualizationMode) => void
  onRiskProfileChange: (r: RiskProfile) => void
  onLoad: () => void
}

const TIMEFRAMES: Timeframe[] = ['1Min', '5Min', '15Min', '1Hour', '1Day', '1Week', '1Month']
const CHART_TYPES: ChartType[] = ['candlestick', 'line', 'area', 'ohlc', 'heikin-ashi']
const RISK_PROFILES: RiskProfile[] = ['low', 'moderate', 'high']
const VISUAL_OPTIONS: { value: VisualizationMode; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'returns', label: 'Returns %' },
  { value: 'moving-averages', label: 'MA Overlay' },
  { value: 'volume', label: 'Volume Focus' },
  { value: 'vwap', label: 'VWAP' },
  { value: 'multi', label: 'Multi-Symbol' },
]

export function Controls({
  symbol,
  timeframe,
  chartType,
  visualization,
  riskProfile,
  loading,
  onSymbolChange,
  onTimeframeChange,
  onChartTypeChange,
  onVisualizationChange,
  onRiskProfileChange,
  onLoad,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-2xl border border-border">
      {/* Symbol */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={symbol}
          onChange={(e) => onSymbolChange(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && onLoad()}
          placeholder="Symbol"
          className="w-24 px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring uppercase"
        />
      </div>

      {/* Timeframe */}
      <div className="flex items-center bg-muted rounded-lg p-1">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              timeframe === tf
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Chart type */}
      <div className="flex items-center bg-muted rounded-lg p-1">
        {CHART_TYPES.map((ct) => (
          <button
            key={ct}
            onClick={() => onChartTypeChange(ct)}
            className={`px-2 py-1 text-xs rounded-md transition-colors capitalize ${
              chartType === ct
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {ct === 'heikin-ashi' ? 'HA' : ct}
          </button>
        ))}
      </div>

      {/* Visualization */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">View</span>
        <select
          value={visualization}
          onChange={(e) => onVisualizationChange(e.target.value as VisualizationMode)}
          className="px-2 py-1.5 text-xs rounded-md bg-[#1A1A1A] border border-[#333] text-white"
        >
          {VISUAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Risk profile */}
      <div className="flex items-center bg-muted rounded-lg p-1">
        {RISK_PROFILES.map((rp) => (
          <button
            key={rp}
            onClick={() => onRiskProfileChange(rp)}
            className={`px-2 py-1 text-xs rounded-md transition-colors capitalize ${
              riskProfile === rp
                ? rp === 'low'
                  ? 'bg-green-100 text-green-700 shadow-sm dark:bg-green-900/60 dark:text-green-300'
                  : rp === 'moderate'
                  ? 'bg-yellow-100 text-yellow-700 shadow-sm dark:bg-yellow-900/60 dark:text-yellow-300'
                  : 'bg-red-100 text-red-700 shadow-sm dark:bg-red-900/60 dark:text-red-300'
                : 'text-muted-foreground hover:text-foreground'
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
