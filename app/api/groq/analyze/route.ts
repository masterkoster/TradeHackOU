import { NextResponse } from 'next/server'
import type { Bar, RiskProfile, Timeframe } from '@/types'
import { buildGroqPrompt } from '@/lib/historicAnalysis'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

type Payload = {
  symbol: string
  bars: Bar[]
  timeframe: Timeframe
  riskProfile: RiskProfile
  newsHeadlines?: string[]
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 })
  }

  try {
    const { symbol, bars, timeframe, riskProfile, newsHeadlines } = (await req.json()) as Payload
    if (!symbol || !bars || !timeframe || !riskProfile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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
      return NextResponse.json({ error: `Groq API error ${res.status}: ${text}` }, { status: res.status })
    }

    const data = (await res.json()) as { choices: Array<{ message: { content: string } }> }
    const content = data.choices?.[0]?.message?.content ?? ''

    return NextResponse.json({ content, model: MODEL })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
