'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
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

function getChartColors(isDark: boolean) {
  return {
    background: isDark ? '#0D0D0D' : '#ffffff',
    textColor: isDark ? '#9ca3af' : '#374151',
    gridColor: isDark ? '#1f2028' : '#e5e7eb',
    borderColor: isDark ? '#2e303a' : '#d1d5db',
  }
}

export function CompareChart({ series }: CompareChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const linesRef = useRef<ISeriesApi<'Line'>[]>([])
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!containerRef.current) return

    const isDark = document.documentElement.classList.contains('dark')
    const colors = getChartColors(isDark)

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        borderColor: colors.borderColor,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: { borderColor: colors.borderColor, timeVisible: true, secondsVisible: false },
      width: containerRef.current.clientWidth,
      height: 360,
      localization: {
        priceFormatter: (p: number) => {
          const sign = p >= 0 ? '+' : ''
          return `${sign}${p.toFixed(2)}%`
        },
      },
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

  // Update chart colors when theme changes
  useEffect(() => {
    if (!chartRef.current) return
    const isDark = resolvedTheme === 'dark'
    const colors = getChartColors(isDark)
    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor },
      },
      rightPriceScale: { borderColor: colors.borderColor },
      timeScale: { borderColor: colors.borderColor, timeVisible: true, secondsVisible: false },
    })
  }, [resolvedTheme])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    linesRef.current.forEach((s) => chart.removeSeries(s))
    linesRef.current = []

    const active = series.filter((s) => s.bars.length > 0)
    if (active.length === 0) return

    active.forEach(({ bars, color }) => {
      const base = bars[0].close
      const line = chart.addLineSeries({
        color,
        lineWidth: 2,
        priceFormat: { type: 'custom', formatter: (p: number) => `${p >= 0 ? '+' : ''}${p.toFixed(2)}%` },
      })
      line.setData(
        bars.map((b) => ({
          time: b.time as UTCTimestamp,
          value: ((b.close - base) / base) * 100,
        }))
      )
      linesRef.current.push(line)
    })

    chart.timeScale().fitContent()
  }, [series])

  return <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
}
