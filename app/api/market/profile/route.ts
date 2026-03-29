import { NextRequest, NextResponse } from 'next/server'

type YahooProfile = {
  assetProfile?: {
    longBusinessSummary?: string
    sector?: string
    industry?: string
    fullTimeEmployees?: number
    website?: string
  }
  price?: {
    longName?: string
    shortName?: string
    symbol?: string
    marketCap?: { raw?: number }
  }
  summaryDetail?: {
    trailingEps?: { raw?: number }
    trailingPE?: { raw?: number }
    dividendYield?: { raw?: number }
  }
}

const getDomain = (website?: string) => {
  if (!website) return null
  try {
    return new URL(website).hostname
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')?.toUpperCase()

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(
        symbol
      )}?modules=assetProfile,summaryDetail,price`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text || 'Upstream error' }, { status: res.status })
    }

    const json = (await res.json()) as {
      quoteSummary?: { result?: YahooProfile[] }
    }

    const result = json.quoteSummary?.result?.[0]
    if (!result) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    const domain = getDomain(result.assetProfile?.website)
    const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null

    return NextResponse.json({
      symbol: result.price?.symbol ?? symbol,
      name: result.price?.longName ?? result.price?.shortName ?? symbol,
      summary: result.assetProfile?.longBusinessSummary ?? '',
      sector: result.assetProfile?.sector ?? null,
      industry: result.assetProfile?.industry ?? null,
      employees: result.assetProfile?.fullTimeEmployees ?? null,
      marketCap: result.price?.marketCap?.raw ?? null,
      eps: result.summaryDetail?.trailingEps?.raw ?? null,
      pe: result.summaryDetail?.trailingPE?.raw ?? null,
      dividendYield: result.summaryDetail?.dividendYield?.raw ?? null,
      website: result.assetProfile?.website ?? null,
      logoUrl,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
