'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { RiskProfile } from '@/types'

const STORAGE_KEY = 'tradehack_risk_profile'

interface RiskProfileContextValue {
  riskProfile: RiskProfile
  setRiskProfile: (r: RiskProfile) => void
}

const RiskProfileContext = createContext<RiskProfileContextValue>({
  riskProfile: 'moderate',
  setRiskProfile: () => {},
})

export function RiskProfileProvider({ children }: { children: React.ReactNode }) {
  const [riskProfile, setRiskProfileState] = useState<RiskProfile>('moderate')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as RiskProfile | null
    if (stored === 'low' || stored === 'moderate' || stored === 'high') {
      setRiskProfileState(stored)
    }
  }, [])

  const setRiskProfile = (r: RiskProfile) => {
    localStorage.setItem(STORAGE_KEY, r)
    setRiskProfileState(r)
  }

  return (
    <RiskProfileContext.Provider value={{ riskProfile, setRiskProfile }}>
      {children}
    </RiskProfileContext.Provider>
  )
}

export function useRiskProfile() {
  return useContext(RiskProfileContext)
}
