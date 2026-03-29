import { NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

interface SymbolSnap {
  symbol: string
  price: number
  changePct: number
  volume: number
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 })
  }

  try {
    const { symbols, snaps } = (await req.json()) as { symbols: string[]; snaps: SymbolSnap[] }

    if (!symbols?.length) {
      return NextResponse.json({ error: 'No symbols provided' }, { status: 400 })
    }

    const rows = snaps
      .map((s) => `${s.symbol}: $${s.price.toFixed(2)}, ${s.changePct >= 0 ? '+' : ''}${s.changePct.toFixed(2)}% today, vol ${s.volume.toLocaleString()}`)
      .join('\n')

    const system =
      'You are a professional portfolio analyst and market strategist. ' +
      'Be direct, opinionated, and actionable. Respond ONLY with valid JSON.'

    const user = `The user has favorited this watchlist of stocks:

${rows}

Based on this watchlist, provide:
1. An overall market outlook and sentiment (what does this portfolio reveal about the user's market thesis?)
2. Which stocks look strongest and weakest right now
3. Sector/theme concentration risks
4. A clear trading plan / action items for the near term
5. Key risk factors to watch

Respond ONLY with JSON matching this exact schema:
{
  "outlook": "<2-3 sentence big-picture market view based on this watchlist>",
  "thesis": "<what market thesis or style does this watchlist suggest — growth, defensive, momentum, etc.>",
  "strongestPicks": ["<symbol>"],
  "weakestPicks": ["<symbol>"],
  "concentration": "<sector or theme concentration risk note>",
  "plan": "<concrete near-term trading plan, 3-5 bullet points as a single string with newlines>",
  "risks": "<top 2-3 risk factors to watch>",
  "sentiment": "<bullish|bearish|neutral|mixed>"
}`

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
        temperature: 0.4,
        max_tokens: 700,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Groq error ${res.status}: ${text}` }, { status: res.status })
    }

    const data = (await res.json()) as { choices: Array<{ message: { content: string } }> }
    const content = data.choices?.[0]?.message?.content ?? ''
    return NextResponse.json({ content, model: MODEL })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
