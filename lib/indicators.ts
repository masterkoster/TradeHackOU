import type { Bar } from '@/types'

export type LinePoint = { time: number; value: number }

export function toReturnsSeries(bars: Bar[]): LinePoint[] {
  if (bars.length === 0) return []
  const base = bars[0].close
  if (!base) return []
  return bars.map((b) => ({ time: b.time, value: ((b.close - base) / base) * 100 }))
}

export function sma(bars: Bar[], period: number): LinePoint[] {
  const points: LinePoint[] = []
  let sum = 0
  for (let i = 0; i < bars.length; i++) {
    sum += bars[i].close
    if (i >= period) {
      sum -= bars[i - period].close
    }
    if (i >= period - 1) {
      points.push({ time: bars[i].time, value: sum / period })
    }
  }
  return points
}

export function vwap(bars: Bar[]): LinePoint[] {
  const points: LinePoint[] = []
  let cumulativePV = 0
  let cumulativeVolume = 0
  for (const b of bars) {
    const typical = (b.high + b.low + b.close) / 3
    cumulativePV += typical * b.volume
    cumulativeVolume += b.volume
    if (cumulativeVolume > 0) {
      points.push({ time: b.time, value: cumulativePV / cumulativeVolume })
    }
  }
  return points
}
