'use client'

import type { RiskProfile, Signal } from '@/types'

interface RiskProfileProps {
  signal: Signal
  riskProfile: RiskProfile
  marketOpen?: boolean
  marketLabel?: string
}

const SIGNAL_STYLES: Record<NonNullable<Signal>, string> = {
  BUY: 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/50 dark:border-green-600/50 dark:text-green-300',
  SELL: 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/50 dark:border-red-600/50 dark:text-red-300',
  HOLD: 'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900/50 dark:border-yellow-600/50 dark:text-yellow-300',
}

export function RiskProfileBadge({ signal, riskProfile, marketOpen, marketLabel }: RiskProfileProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground capitalize">{riskProfile} risk</span>
      <span
        className={`px-2 py-0.5 text-[11px] font-semibold uppercase rounded border ${
          marketOpen
            ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/40 dark:border-green-600/50 dark:text-green-300'
            : 'bg-muted border-border text-muted-foreground'
        }`}
      >
        {marketLabel ?? (marketOpen ? 'Open' : 'Closed')}
      </span>
      {signal && (
        <span className={`px-3 py-0.5 text-sm font-bold rounded border ${SIGNAL_STYLES[signal]}`}>
          {signal}
        </span>
      )}
    </div>
  )
}
