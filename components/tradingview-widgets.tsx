"use client"

import { useEffect, useRef } from 'react'

type WidgetConfig = Record<string, unknown>

const useTradingViewWidget = (config: WidgetConfig) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js'
    script.async = true
    script.type = 'text/javascript'
    script.innerHTML = JSON.stringify(config)

    containerRef.current.appendChild(script)
  }, [config])

  return containerRef
}

export function TradingViewSymbolOverview({ symbol }: { symbol: string }) {
  const config = {
    symbols: [[symbol, symbol]],
    chartOnly: false,
    width: '100%',
    height: 420,
    locale: 'en',
    colorTheme: 'dark',
    autosize: true,
    showVolume: true,
    showMA: true,
    hideDateRanges: false,
    hideMarketStatus: false,
    hideSymbolLogo: false,
    scalePosition: 'right',
    scaleMode: 'Normal',
    fontFamily: 'Inter, sans-serif',
    fontSize: '12',
    noTimeScale: false,
    valuesTracking: '1',
  }

  const ref = useTradingViewWidget(config)

  return <div ref={ref} className="min-h-[420px]" />
}

export function TradingViewMarketOverview() {
  const config = {
    colorTheme: 'dark',
    dateRange: '12M',
    showChart: true,
    locale: 'en',
    width: '100%',
    height: 420,
    largeChartUrl: '',
    isTransparent: true,
    showSymbolLogo: true,
    showFloatingTooltip: true,
    plotLineColorGrowing: 'rgba(34,197,94,0.6)',
    plotLineColorFalling: 'rgba(239,68,68,0.6)',
    gridLineColor: 'rgba(255,255,255,0.06)',
    scaleFontColor: 'rgba(255,255,255,0.65)',
    belowLineFillColorGrowing: 'rgba(34,197,94,0.08)',
    belowLineFillColorFalling: 'rgba(239,68,68,0.08)',
    belowLineFillColorGrowingBottom: 'rgba(34,197,94,0.0)',
    belowLineFillColorFallingBottom: 'rgba(239,68,68,0.0)',
    symbolActiveColor: 'rgba(34,197,94,0.12)',
    tabs: [
      {
        title: 'Indices',
        symbols: [
          { s: 'SP:SPX', d: 'S&P 500' },
          { s: 'NASDAQ:NDX', d: 'Nasdaq 100' },
          { s: 'DJ:DJI', d: 'Dow 30' },
          { s: 'AMEX:IWM', d: 'Russell 2000' },
        ],
        originalTitle: 'Indices',
      },
      {
        title: 'ETFs',
        symbols: [
          { s: 'AMEX:SPY', d: 'SPY' },
          { s: 'NASDAQ:QQQ', d: 'QQQ' },
          { s: 'AMEX:DIA', d: 'DIA' },
          { s: 'AMEX:VTI', d: 'VTI' },
        ],
        originalTitle: 'ETFs',
      },
    ],
  }

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'
    script.async = true
    script.type = 'text/javascript'
    script.innerHTML = JSON.stringify(config)

    containerRef.current.appendChild(script)
  }, [])

  return <div ref={containerRef} className="min-h-[420px]" />
}
