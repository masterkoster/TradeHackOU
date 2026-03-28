import type { RiskProfile, Signal } from '@/types'

const THRESHOLDS: Record<RiskProfile, { buyBullish: number; sellBearish: number }> = {
  low:      { buyBullish: 75, sellBearish: 45 },
  moderate: { buyBullish: 60, sellBearish: 55 },
  high:     { buyBullish: 45, sellBearish: 70 },
}

export function calcSignal(
  sentiment: 'positive' | 'negative' | 'neutral',
  confidence: number,
  riskProfile: RiskProfile
): Signal {
  const { buyBullish, sellBearish } = THRESHOLDS[riskProfile]
  if (sentiment === 'positive' && confidence >= buyBullish) return 'BUY'
  if (sentiment === 'negative' && confidence >= sellBearish) return 'SELL'
  return 'HOLD'
}
