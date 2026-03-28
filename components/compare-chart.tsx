'use client'

import { useEffect, useRef } from 'react'
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts'
import { ColorType, createChart } from 'lightweight-charts'
import type { Bar } from '@/types'

export interface StockSeries {
  symbol: string
  bars: Bar[]
  color: string
}

interface CompareChartProps {
  series: StockSeries[]
}

export function CompareChart({ series }: CompareChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const linesRef = useRef<ISeriesApi<'Line'>[]>([])

  // Create chart once
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0D0D0D' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2028' },
        horzLines: { color: '#1f2028' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#2e303a' },
      timeScale: { borderColor: '#2e303a', timeVisible: true, secondsVisible: false },
      width: containerRef.current.clientWidth,
      height: 360,
    })
    chartRef.current = chart

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      linesRef.current = []
    }
  }, [])

  // Rebuild series when data changes
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    // Remove old series
    linesRef.current.forEach((s) => chart.removeSeries(s))
    linesRef.current = []

    const activeSeries = series.filter((s) => s.bars.length > 0)
    if (activeSeries.length === 0) return

    activeSeries.forEach(({ bars, color }) => {
      const line = chart.addLineSeries({ color, lineWidth: 2 })
      line.setData(bars.map((b) => ({ time: b.time as UTCTimestamp, value: b.close })))
      linesRef.current.push(line)
    })

    chart.timeScale().fitContent()
  }, [series])

  return <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
}
