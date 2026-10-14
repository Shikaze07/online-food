"use client"

import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2.5 self-center font-bold text-lg">
          <div className="flex size-8 items-center justify-center overflow-hidden rounded-lg bg-background border border-border p-0.5 shadow-sm">
            <Image src="/icon.png" alt="Albertoz Logo" width={32} height={32} className="h-full w-full object-contain" priority />
          </div>
          Albertoz Pizza
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
