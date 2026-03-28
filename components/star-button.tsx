'use client'

import { Star } from 'lucide-react'
import { useFavorites } from '@/contexts/FavoritesContext'

interface StarButtonProps {
  symbol: string
  size?: number
  className?: string
}

export function StarButton({ symbol, size = 14, className = '' }: StarButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(symbol)

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggleFavorite(symbol) }}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      className={`transition-colors ${className}`}
    >
      <Star
        size={size}
        className={active ? 'fill-yellow-400 text-yellow-400' : 'text-white/25 hover:text-white/60'}
        strokeWidth={active ? 0 : 1.5}
      />
    </button>
  )
}
