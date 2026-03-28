import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const metrics = [
  {
    label: 'Markets',
    value: 'US Stocks',
    subtext: 'Equities, ETFs, options',
  },
  {
    label: 'Data',
    value: 'Real-time',
    subtext: 'Paper trading feeds',
  },
  {
    label: 'Access',
    value: '24/7',
    subtext: 'Web and mobile ready',
  },
]

export function DashboardMetrics() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-white border-black/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
              {metric.label}
            </CardTitle>
            <CardDescription className="text-3xl font-semibold text-black">
              {metric.value}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-black/50">{metric.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
