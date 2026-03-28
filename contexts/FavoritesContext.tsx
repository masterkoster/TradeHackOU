'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const LS_KEY = 'tradehack:favorites'

interface FavoritesContextValue {
  favorites: string[]
  isFavorite: (symbol: string) => boolean
  toggleFavorite: (symbol: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
})

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setFavorites(JSON.parse(raw) as string[])
    } catch { /* ignore */ }
  }, [])

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => {
      const next = prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  const isFavorite = useCallback((symbol: string) => favorites.includes(symbol), [favorites])

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
