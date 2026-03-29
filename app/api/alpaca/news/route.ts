import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbols = searchParams.get('symbols') ?? ''
  const apiKey = process.env.ALPACA_API_KEY
  const apiSecret = process.env.ALPACA_SECRET_KEY

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Missing Alpaca API credentials' }, { status: 500 })
  }

  try {
    const dataBaseUrl = process.env.ALPACA_DATA_URL ?? 'https://data.alpaca.markets'
    const res = await fetch(
      `${dataBaseUrl}/v1beta1/news?symbols=${encodeURIComponent(symbols)}&limit=10&sort=desc`,
      {
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': apiSecret,
        },
        cache: 'no-store',
      }
    )
    if (res.status === 429) {
      return NextResponse.json({ error: 'Rate limited — try again shortly' }, { status: 429 })
    }
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text || 'Alpaca error' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
