import type { Bar, RiskProfile, Timeframe } from '@/types'

function downsample(bars: Bar[], maxBars = 120): Bar[] {
  if (bars.length <= maxBars) return bars
  const step = Math.ceil(bars.length / maxBars)
  return bars.filter((_, i) => i % step === 0).slice(0, maxBars)
}

function toCSV(bars: Bar[]): string {
  const rows = bars.map(
    (b) =>
      `${new Date(b.time * 1000).toISOString().slice(0, 10)},${b.open.toFixed(2)},${b.high.toFixed(2)},${b.low.toFixed(2)},${b.close.toFixed(2)},${b.volume}`
  )
  return ['time,open,high,low,close,volume', ...rows].join('\n')
}

function computeStats(bars: Bar[]) {
  const first = bars[0].close
  const last = bars[bars.length - 1].close
  const pct = (((last - first) / first) * 100).toFixed(2)
  const high = Math.max(...bars.map((b) => b.high)).toFixed(2)
  const low = Math.min(...bars.map((b) => b.low)).toFixed(2)
  const avgVol = Math.round(bars.reduce((s, b) => s + b.volume, 0) / bars.length)
  return { pct, high, low, avgVol }
}

export function buildGroqPrompt(
  symbol: string,
  bars: Bar[],
  timeframe: Timeframe,
  riskProfile: RiskProfile,
  newsHeadlines?: string[]
): { system: string; user: string } {
  const sampled = downsample(bars)
  const stats = computeStats(sampled)
  const csv = toCSV(sampled)

  const system =
    'You are a quantitative market analyst. Be concise and data-driven. ' +
    'Always respond with valid JSON matching the schema provided. Do not include any text outside the JSON.'

  const newsBlock =
    newsHeadlines && newsHeadlines.length > 0
      ? `\nRecent news headlines:\n${newsHeadlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
      : ''

  const user = `Analyze ${symbol} on the ${timeframe} timeframe.

Stats: ${stats.pct}% change, High: $${stats.high}, Low: $${stats.low}, Avg Volume: ${stats.avgVol.toLocaleString()}

OHLCV data (CSV):
${csv}
${newsBlock}
Risk profile: The user is a ${riskProfile} risk trader.

Respond ONLY with JSON matching this exact schema:
{
  "summary": "<plain-English narrative, 2-3 sentences>",
  "keyLevels": {
    "support": [<price numbers>],
    "resistance": [<price numbers>]
  },
  "trend": "<bullish|bearish|sideways>",
  "patterns": ["<pattern name>"],
  "riskNotes": "<risk notes tailored to ${riskProfile} risk profile>"
}`

  return { system, user }
}
