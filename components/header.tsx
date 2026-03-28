"use client"

import { useState } from 'react'
import { FinbroLogo } from "@/components/finbro-logo"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"

const navItems = ['Markets', 'Pricing', 'About']

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-white/70 backdrop-blur-sm border-b border-black/10">
      <div className="flex items-center gap-10">
        <FinbroLogo className="text-black h-7 w-auto" />
        <nav className="hidden md:flex items-center gap-6 text-sm text-black/70">
          {navItems.map((item) => (
            <button key={item} className="hover:text-black transition-colors">
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" className="text-black" onClick={() => setOpen(true)}>
          Login
        </Button>
        <Button className="bg-black text-white hover:bg-black/90" onClick={() => setOpen(true)}>
          Open Account
        </Button>
      </div>

      <AuthModal open={open} onOpenChange={setOpen} />
    </header>
  )
}
