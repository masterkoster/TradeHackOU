export function FinbroLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 210 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ height: '100%', width: 'auto' }}
    >
      <defs>
        <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      {/* small accent bar */}
      <rect x="0" y="6" width="4" height="24" rx="2" fill="url(#accentGrad)" />
      {/* wordmark */}
      <text
        x="12"
        y="28"
        fontFamily="'Arial Black', 'Impact', ui-sans-serif, system-ui, sans-serif"
        fontWeight="900"
        fontSize="26"
        fill="currentColor"
        letterSpacing="2"
      >
        YEILDRA
      </text>
    </svg>
  )
}
