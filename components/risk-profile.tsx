'use client'

import type { RiskProfile, Signal } from '@/types'

interface RiskProfileProps {
  signal: Signal
  riskProfile: RiskProfile
  marketOpen?: boolean
  marketLabel?: string
}

const SIGNAL_STYLES: Record<NonNullable<Signal>, string> = {
  BUY: 'bg-green-900/50 border-green-600/50 text-green-300',
  SELL: 'bg-red-900/50 border-red-600/50 text-red-300',
  HOLD: 'bg-yellow-900/50 border-yellow-600/50 text-yellow-300',
}

export function RiskProfileBadge({ signal, riskProfile, marketOpen, marketLabel }: RiskProfileProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 capitalize">{riskProfile} risk</span>
      <span
        className={`px-2 py-0.5 text-[11px] font-semibold uppercase rounded border ${
          marketOpen ? 'bg-green-900/40 border-green-600/50 text-green-300' : 'bg-gray-800/60 border-gray-600/50 text-gray-300'
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
