import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbols = searchParams.get('symbols') ?? ''

  try {
    const res = await fetch(
      `https://data.alpaca.markets/v1beta1/news?symbols=${encodeURIComponent(symbols)}&limit=10&sort=desc`,
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
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
