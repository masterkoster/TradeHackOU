const rows = [
  {
    title: 'Low-cost execution',
    detail: 'Keep fees tight with competitive routing and spreads.',
  },
  {
    title: 'Portfolio visibility',
    detail: 'Overlay symbols and monitor performance in one place.',
  },
  {
    title: 'API-first access',
    detail: 'Integrate Alpaca streaming data for rapid prototypes.',
  },
]

export function TickerList() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {rows.map((row) => (
        <div key={row.title} className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-black dark:text-white">{row.title}</h3>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">{row.detail}</p>
        </div>
      ))}
    </section>
  )
}
