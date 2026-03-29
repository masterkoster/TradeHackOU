import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  const timeframe = searchParams.get('timeframe') ?? '1Day'
  const limit = searchParams.get('limit') ?? '200'
  const feed = process.env.ALPACA_FEED ?? 'iex'
  const apiKey = process.env.ALPACA_API_KEY
  const apiSecret = process.env.ALPACA_SECRET_KEY
  const end = new Date()
  const startParam = searchParams.get('start')
  const start = startParam ? new Date(startParam) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Missing Alpaca API credentials' }, { status: 500 })
  }

  try {
    const dataBaseUrl = process.env.ALPACA_DATA_URL ?? 'https://data.alpaca.markets'
    const res = await fetch(
      `${dataBaseUrl}/v2/stocks/${encodeURIComponent(symbol)}/bars?timeframe=${timeframe}&limit=${limit}&feed=${feed}&adjustment=raw&start=${start.toISOString()}&end=${end.toISOString()}`,
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
    return NextResponse.json({ error: 'Failed to fetch bars' }, { status: 500 })
  }
}
