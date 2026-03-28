import type { Bar } from '@/types'

export function toHeikinAshi(bars: Bar[]): Bar[] {
  const ha: Bar[] = []
  for (let i = 0; i < bars.length; i++) {
    const curr = bars[i]
    const prev = ha[i - 1] ?? curr
    const haClose = (curr.open + curr.high + curr.low + curr.close) / 4
    const haOpen = (prev.open + prev.close) / 2
    ha.push({
      time: curr.time,
      open: haOpen,
      high: Math.max(curr.high, haOpen, haClose),
      low: Math.min(curr.low, haOpen, haClose),
      close: haClose,
      volume: curr.volume,
    })
  }
  return ha
}
