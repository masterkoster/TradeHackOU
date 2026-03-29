import { NextRequest, NextResponse } from 'next/server'

type SeriesPoint = { period: string; value: number }

const SERIES_LABELS: Record<string, string> = {
  price: 'Price',
  eps: 'EPS (Quarterly)',
  revenue: 'Revenue (Quarterly)',
  netIncome: 'Net Income (Quarterly)',
  assets: 'Total Assets (Quarterly)',
  cashflow: 'Operating Cash Flow (Quarterly)',
}

const parseNumber = (value?: string) => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')?.toUpperCase()
  const metric = searchParams.get('metric') ?? 'price'

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  }

  if (!SERIES_LABELS[metric]) {
    return NextResponse.json({ error: 'invalid metric' }, { status: 400 })
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing ALPHA_VANTAGE_API_KEY' }, { status: 500 })
  }

  try {
    const buildResponse = (label: string, points: SeriesPoint[]) =>
      NextResponse.json({ label, points })

    if (metric === 'price') {
      const res = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(
          symbol
        )}&outputsize=compact&apikey=${apiKey}`,
        { cache: 'no-store' }
      )
      if (!res.ok) {
        const text = await res.text()
        return NextResponse.json({ error: text || 'Upstream error' }, { status: res.status })
      }
      const json = (await res.json()) as Record<string, Record<string, Record<string, string>>>
      const series = json['Time Series (Daily)'] ?? {}
      const points = Object.entries(series)
        .slice(0, 30)
        .map(([date, row]) => ({ period: date, value: Number(row['4. close']) }))
        .filter((p) => Number.isFinite(p.value))
        .reverse()
      return buildResponse(SERIES_LABELS[metric], points)
    }

    const fetchJson = async (fn: string) => {
      const res = await fetch(
        `https://www.alphavantage.co/query?function=${fn}&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`,
        { cache: 'no-store' }
      )
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Upstream error')
      }
      return res.json() as Promise<Record<string, unknown>>
    }

    if (metric === 'eps') {
      const data = await fetchJson('EARNINGS')
      const series = (data['quarterlyEarnings'] as Array<Record<string, string>>) ?? []
      const points = series
        .slice(0, 8)
        .map((row) => ({
          period: row['fiscalDateEnding'],
          value: Number(row['reportedEPS']),
        }))
        .filter((p) => Number.isFinite(p.value))
        .reverse()
      return buildResponse(SERIES_LABELS[metric], points)
    }

    if (metric === 'revenue' || metric === 'netIncome') {
      const data = await fetchJson('INCOME_STATEMENT')
      const series = (data['quarterlyReports'] as Array<Record<string, string>>) ?? []
      const key = metric === 'revenue' ? 'totalRevenue' : 'netIncome'
      const points = series
        .slice(0, 8)
        .map((row) => ({
          period: row['fiscalDateEnding'],
          value: Number(row[key]),
        }))
        .filter((p) => Number.isFinite(p.value))
        .reverse()
      return buildResponse(SERIES_LABELS[metric], points)
    }

    if (metric === 'assets') {
      const data = await fetchJson('BALANCE_SHEET')
      const series = (data['quarterlyReports'] as Array<Record<string, string>>) ?? []
      const points = series
        .slice(0, 8)
        .map((row) => ({
          period: row['fiscalDateEnding'],
          value: Number(row['totalAssets']),
        }))
        .filter((p) => Number.isFinite(p.value))
        .reverse()
      return buildResponse(SERIES_LABELS[metric], points)
    }

    if (metric === 'cashflow') {
      const data = await fetchJson('CASH_FLOW')
      const series = (data['quarterlyReports'] as Array<Record<string, string>>) ?? []
      const points = series
        .slice(0, 8)
        .map((row) => ({
          period: row['fiscalDateEnding'],
          value: Number(row['operatingCashflow']),
        }))
        .filter((p) => Number.isFinite(p.value))
        .reverse()
      return buildResponse(SERIES_LABELS[metric], points)
    }

    return NextResponse.json({ error: 'Unsupported metric' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
