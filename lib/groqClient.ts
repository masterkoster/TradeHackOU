import type { Bar, GroqAnalysis, RiskProfile, Timeframe } from '@/types'
import { buildGroqPrompt } from './historicAnalysis'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export async function analyzeHistory(
  symbol: string,
  bars: Bar[],
  timeframe: Timeframe,
  riskProfile: RiskProfile,
  newsHeadlines?: string[]
): Promise<GroqAnalysis> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY
  if (!apiKey) throw new Error('Groq API key not configured')

  const { system, user } = buildGroqPrompt(symbol, bars, timeframe, riskProfile, newsHeadlines)

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Groq API error ${res.status}: ${text}`)
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }> }
  const content = data.choices?.[0]?.message?.content ?? ''

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
    model: MODEL,
  }
}
