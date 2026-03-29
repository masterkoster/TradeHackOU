'use client'

import type { GroqAnalysis, GroqStatus } from '@/types'

interface HistoricAnalysisProps {
  symbol: string
  timeframe: string
  status: GroqStatus
  analysis: GroqAnalysis | null
  error: string | null
  onRun: () => void
  onRetry: () => void
}

function Skeleton() {
  return <div className="h-4 bg-muted rounded animate-pulse" />
}

export function HistoricAnalysis({
  symbol,
  timeframe,
  status,
  analysis,
  error,
  onRun,
  onRetry,
}: HistoricAnalysisProps) {
  const TREND_STYLES = {
    bullish: 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/50 dark:border-green-600/50 dark:text-green-300',
    bearish: 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/50 dark:border-red-600/50 dark:text-red-300',
    sideways: 'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900/50 dark:border-yellow-600/50 dark:text-yellow-300',
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-2xl border border-border">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-medium text-foreground">
            AI Analysis · {symbol} · {timeframe}
          </h3>
          <span className="px-2 py-0.5 text-xs bg-muted border border-border rounded text-muted-foreground">
            Groq
          </span>
        </div>
        <button
          onClick={status === 'error' ? onRetry : onRun}
          disabled={status === 'loading'}
          className="px-4 py-1.5 bg-muted hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed border border-border text-sm text-foreground rounded-lg transition-colors"
        >
          {status === 'loading' ? 'Analysing…' : status === 'error' ? 'Retry' : 'Run Analysis'}
        </button>
      </div>

      {/* Error */}
      {status === 'error' && error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-300 rounded-lg px-4 py-2 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/30">
          {error}
        </p>
      )}

      {/* Idle placeholder */}
      {status === 'idle' && (
        <p className="text-sm text-muted-foreground">
          Click &quot;Run Analysis&quot; to get AI-powered insights for {symbol}.
        </p>
      )}

      {/* Content */}
      {(status === 'loading' || status === 'done') && (
        <div className="flex flex-col gap-4">
          {/* Trend pill */}
          <div className="flex items-center gap-3">
            {status === 'loading' ? (
              <div className="w-24 h-6 bg-muted rounded-full animate-pulse" />
            ) : (
              analysis && (
                <span
                  className={`px-3 py-0.5 text-sm font-medium rounded-full border ${
                    TREND_STYLES[analysis.trend]
                  } capitalize`}
                >
                  {analysis.trend}
                </span>
              )
            )}
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Summary</span>
            {status === 'loading' ? (
              <div className="flex flex-col gap-2">
                <Skeleton />
                <Skeleton />
                <div className="w-2/3"><Skeleton /></div>
              </div>
            ) : (
              <p className="text-sm text-foreground/80 leading-relaxed">{analysis?.summary}</p>
            )}
          </div>

          {/* Key levels */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Key Levels</span>
            {status === 'loading' ? (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-16 h-6 bg-muted rounded-full animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis?.keyLevels.support.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 text-xs bg-green-100 border border-green-400 text-green-700 rounded-full dark:bg-green-900/30 dark:border-green-700/40 dark:text-green-300"
                  >
                    S ${p.toFixed(2)}
                  </span>
                ))}
                {analysis?.keyLevels.resistance.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 text-xs bg-red-100 border border-red-400 text-red-700 rounded-full dark:bg-red-900/30 dark:border-red-700/40 dark:text-red-300"
                  >
                    R ${p.toFixed(2)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Patterns */}
          {(status === 'done' && analysis && analysis.patterns.length > 0) && (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Patterns</span>
              <div className="flex flex-wrap gap-2">
                {analysis.patterns.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 text-xs bg-muted border border-border text-foreground/80 rounded-full"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Risk notes */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Risk Notes</span>
            {status === 'loading' ? (
              <div className="flex flex-col gap-2">
                <Skeleton />
                <div className="w-3/4"><Skeleton /></div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{analysis?.riskNotes}</p>
            )}
          </div>

          {/* Footer */}
          {status === 'done' && analysis && (
            <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
              <span>{analysis.model}</span>
              <span>{new Date(analysis.generatedAt).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
