const features = [
  {
    title: 'Multi-asset coverage',
    detail: 'Track US stocks and ETFs with clean, real-time snapshots.',
  },
  {
    title: 'Fast execution',
    detail: 'Paper-trade flows designed for quick iteration and demos.',
  },
  {
    title: 'Secure by design',
    detail: 'Server-side data proxy keeps your keys off the client.',
  },
]

export function PerformanceChart() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {features.map((feature) => (
        <div key={feature.title} className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-black">{feature.title}</h3>
          <p className="mt-2 text-sm text-black/60">{feature.detail}</p>
        </div>
      ))}
    </section>
  )
}
