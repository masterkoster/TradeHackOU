import { NextRequest, NextResponse } from 'next/server'

type AlphaVantageProfile = {
  Symbol?: string
  Name?: string
  Description?: string
  Sector?: string
  Industry?: string
  MarketCapitalization?: string
  EPS?: string
  PERatio?: string
  DividendYield?: string
  FullTimeEmployees?: string
  Website?: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')?.toUpperCase()

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  }

  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing ALPHA_VANTAGE_API_KEY' }, { status: 500 })
    }

    const res = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text || 'Upstream error' }, { status: res.status })
    }

    const result = (await res.json()) as AlphaVantageProfile
    if (!result || !result.Symbol) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    const website = result.Website ?? null
    const logoUrl = website ? `https://logo.clearbit.com/${new URL(website).hostname}` : null

    return NextResponse.json({
      symbol: result.Symbol ?? symbol,
      name: result.Name ?? symbol,
      summary: result.Description ?? '',
      sector: result.Sector ?? null,
      industry: result.Industry ?? null,
      marketCap: result.MarketCapitalization ? Number(result.MarketCapitalization) : null,
      eps: result.EPS ? Number(result.EPS) : null,
      pe: result.PERatio ? Number(result.PERatio) : null,
      dividendYield: result.DividendYield ? Number(result.DividendYield) : null,
      website,
      logoUrl,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
