import type { Bar, GroqAnalysis, RiskProfile, Timeframe } from '@/types'
const MODEL = 'llama-3.3-70b-versatile'

export async function analyzeHistory(
  symbol: string,
  bars: Bar[],
  timeframe: Timeframe,
  riskProfile: RiskProfile,
  newsHeadlines?: string[]
): Promise<GroqAnalysis> {
  const res = await fetch('/api/groq/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ symbol, bars, timeframe, riskProfile, newsHeadlines }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Groq API error ${res.status}`)
  }

  const data = (await res.json()) as { content: string; model?: string }
  const content = data.content ?? ''

  let parsed: Partial<GroqAnalysis>
  try {
    parsed = JSON.parse(content) as Partial<GroqAnalysis>
  } catch {
    parsed = {
      summary: content,
      keyLevels: { support: [], resistance: [] },
      trend: 'sideways',
      patterns: [],
      riskNotes: '',
    }
  }

  return {
    summary: parsed.summary ?? '',
    keyLevels: parsed.keyLevels ?? { support: [], resistance: [] },
    trend: parsed.trend ?? 'sideways',
    patterns: parsed.patterns ?? [],
    riskNotes: parsed.riskNotes ?? '',
    generatedAt: Date.now(),
    model: data.model ?? MODEL,
  }
}
