'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts'
import { ColorType, createChart } from 'lightweight-charts'
import type { Bar, ChartType } from '@/types'
import { toHeikinAshi } from '@/lib/heikinAshi'

interface ChartProps {
  bars: Bar[]
  chartType: ChartType
}

function getChartColors(isDark: boolean) {
  return {
    background: isDark ? '#0D0D0D' : '#ffffff',
    textColor: isDark ? '#9ca3af' : '#374151',
    gridColor: isDark ? '#1f2028' : '#e5e7eb',
    borderColor: isDark ? '#2e303a' : '#d1d5db',
  }
}

export function Chart({ bars, chartType }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const mainSeriesRef = useRef<ISeriesApi<'Candlestick' | 'Line' | 'Area' | 'Bar'> | null>(null)
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const { resolvedTheme } = useTheme()

  // Create chart once on mount
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
      rightPriceScale: { borderColor: colors.borderColor },
      timeScale: { borderColor: colors.borderColor, timeVisible: true, secondsVisible: false },
      width: containerRef.current.clientWidth,
      height: 400,
    })
    chartRef.current = chart

    const vol = chart.addHistogramSeries({
      color: '#3b82f6',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      scaleMargins: { top: 0.8, bottom: 0 },
    } as Parameters<typeof chart.addHistogramSeries>[0])
    volumeRef.current = vol

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      volumeRef.current = null
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

  // Recreate main series when bars or chartType changes
  useEffect(() => {
    const chart = chartRef.current
    if (!chart || bars.length === 0) return

    if (mainSeriesRef.current) {
      chart.removeSeries(mainSeriesRef.current)
      mainSeriesRef.current = null
    }

    const display = chartType === 'heikin-ashi' ? toHeikinAshi(bars) : bars

    if (chartType === 'line') {
      const s = chart.addLineSeries({ color: '#22c55e', lineWidth: 2 })
      s.setData(display.map((b) => ({ time: b.time as UTCTimestamp, value: b.close })))
      mainSeriesRef.current = s as ISeriesApi<'Line'>
    } else if (chartType === 'area') {
      const s = chart.addAreaSeries({
        topColor: 'rgba(34,197,94,0.4)',
        bottomColor: 'rgba(34,197,94,0)',
        lineColor: '#22c55e',
        lineWidth: 2,
      })
      s.setData(display.map((b) => ({ time: b.time as UTCTimestamp, value: b.close })))
      mainSeriesRef.current = s as ISeriesApi<'Area'>
    } else if (chartType === 'ohlc') {
      const s = chart.addBarSeries({ upColor: '#22c55e', downColor: '#ef4444' })
      s.setData(
        display.map((b) => ({
          time: b.time as UTCTimestamp,
          open: b.open,
          high: b.high,
          low: b.low,
          close: b.close,
        }))
      )
      mainSeriesRef.current = s as ISeriesApi<'Bar'>
    } else {
      // candlestick or heikin-ashi
      const s = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      })
      s.setData(
        display.map((b) => ({
          time: b.time as UTCTimestamp,
          open: b.open,
          high: b.high,
          low: b.low,
          close: b.close,
        }))
      )
      mainSeriesRef.current = s as ISeriesApi<'Candlestick'>
    }

    // Volume
    if (volumeRef.current) {
      volumeRef.current.setData(
        bars.map((b) => ({
          time: b.time as UTCTimestamp,
          value: b.volume,
          color: b.close >= b.open ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)',
        }))
      )
    }

    chart.timeScale().fitContent()
  }, [bars, chartType])

  return <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
}
