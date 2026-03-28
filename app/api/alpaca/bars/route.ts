import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  const timeframe = searchParams.get('timeframe') ?? '1Day'
  const limit = searchParams.get('limit') ?? '200'
  const feed = process.env.ALPACA_FEED ?? 'iex'

  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  try {
    const res = await fetch(
      `https://data.alpaca.markets/v2/stocks/${encodeURIComponent(symbol)}/bars?timeframe=${timeframe}&limit=${limit}&feed=${feed}&adjustment=raw`,
      {
        headers: {
          'APCA-API-KEY-ID': process.env.ALPACA_API_KEY ?? '',
          'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY ?? '',
        },
        cache: 'no-store',
      }
    )
    if (res.status === 429) return NextResponse.json({ error: 'Rate limited — try again shortly' }, { status: 429 })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bars' }, { status: 500 })
  }
}
