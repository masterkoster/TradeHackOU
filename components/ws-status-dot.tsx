import type { WSStatus } from '@/types'

interface WSStatusDotProps {
  status: WSStatus
}

const COLORS: Record<WSStatus, string> = {
  disconnected: 'bg-gray-500',
  connecting: 'bg-yellow-400 animate-pulse',
  authenticated: 'bg-green-400',
  error: 'bg-red-400',
}

const LABELS: Record<WSStatus, string> = {
  disconnected: 'WS off',
  connecting: 'WS connecting…',
  authenticated: 'WS live',
  error: 'WS error',
}

export function WSStatusDot({ status }: WSStatusDotProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full shrink-0 ${COLORS[status]}`} />
      <span className="text-xs text-muted-foreground">{LABELS[status]}</span>
    </div>
  )
}
