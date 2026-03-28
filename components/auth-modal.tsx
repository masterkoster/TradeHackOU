"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type AuthModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [tab, setTab] = useState('login')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#0f1114] text-white border-[#1f242b]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Welcome back</DialogTitle>
          <p className="text-sm text-white/60">
            Sign in to access your trading workspace.
          </p>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="w-full bg-[#171b22]">
            <TabsTrigger value="login" className="w-full">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="w-full">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <div className="space-y-3">
              <Input placeholder="Email" type="email" />
              <Input placeholder="Password" type="password" />
              <Button className="w-full">Continue</Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <div className="space-y-3">
              <Input placeholder="Name" type="text" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Password" type="password" />
              <Input placeholder="Confirm password" type="password" />
              <Button className="w-full">Create account</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
