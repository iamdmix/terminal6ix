"use client"

import { useAuth } from "@/components/auth-provider"
import { AppShell } from "@/components/app-shell"
import { Panel, PanelHeader, Spinner } from "@/components/ui-kit"
import { ApiError } from "@/lib/types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { toast } from "sonner"

export default function SignInPage() {
  const { login, user, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace("/events")
  }, [loading, user, router])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const u = await login(email, password)
      toast.success(`Signed in as ${u.name}`)
      router.push(u.role === "organiser" ? "/host" : "/events")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Is the API running?")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <Panel>
          <PanelHeader label="auth · sign in" />
          <form onSubmit={onSubmit} className="space-y-5 px-6 py-7">
            <div>
              <label htmlFor="email" className="micro mb-1.5 block">email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="micro mb-1.5 block">password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 border border-primary bg-primary/10 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
            >
              {submitting && <Spinner />} $ t6 login
            </button>
            <p className="text-center text-[13px] text-muted-foreground">
              no account?{" "}
              <Link href="/signup" className="text-primary hover:underline">sign up</Link>
            </p>
          </form>
        </Panel>

        <div className="mt-4 border border-line bg-panel/50 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
          <span className="micro block">demo accounts</span>
          organiser@terminal6ix.dev / organiser123
          <br />
          player@terminal6ix.dev / player123
        </div>
      </main>
    </AppShell>
  )
}
