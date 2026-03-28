interface StaleBannerProps {
  show: boolean
}

export function StaleBanner({ show }: StaleBannerProps) {
  if (!show) return null
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/30 border border-yellow-700/40 rounded-lg text-yellow-300 text-sm">
      <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
      Showing cached data — live fetch failed
    </div>
  )
}
