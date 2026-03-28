import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  const feed = process.env.ALPACA_FEED ?? 'iex'

  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  try {
    const res = await fetch(
      `https://data.alpaca.markets/v2/stocks/${encodeURIComponent(symbol)}/quotes/latest?feed=${feed}`,
      {
        headers: {
          'APCA-API-KEY-ID': process.env.ALPACA_API_KEY ?? '',
          'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY ?? '',
        },
        cache: 'no-store',
      }
    )
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}
