import { NextRequest, NextResponse } from 'next/server'

type FmpProfile = {
  symbol?: string
  companyName?: string
  description?: string
  sector?: string
  industry?: string
  fullTimeEmployees?: number
  mktCap?: number
  eps?: number
  pe?: number
  image?: string
  website?: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')?.toUpperCase()

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  }

  try {
    const apiKey = process.env.FMP_API_KEY || 'demo'
    const res = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(symbol)}?apikey=${apiKey}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text || 'Upstream error' }, { status: res.status })
    }

    const json = (await res.json()) as FmpProfile[]
    const result = json?.[0]
    if (!result) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    return NextResponse.json({
      symbol: result.symbol ?? symbol,
      name: result.companyName ?? symbol,
      summary: result.description ?? '',
      sector: result.sector ?? null,
      industry: result.industry ?? null,
      employees: result.fullTimeEmployees ?? null,
      marketCap: result.mktCap ?? null,
      eps: result.eps ?? null,
      pe: result.pe ?? null,
      dividendYield: null,
      website: result.website ?? null,
      logoUrl: result.image ?? null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
