"use client"

import { useAuth } from "@/components/auth-provider"
import { AppShell } from "@/components/app-shell"
import { Chip, Panel, PanelHeader, Spinner } from "@/components/ui-kit"
import { ApiError, UserRole } from "@/lib/types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { toast } from "sonner"

export default function SignUpPage() {
  const { signup, user, loading } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("participant")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace("/events")
  }, [loading, user, router])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const u = await signup({ name, email, password, role, phone: phone || undefined })
      toast.success(`Account created — welcome, ${u.name}`)
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
          <PanelHeader label="auth · register" />
          <form onSubmit={onSubmit} className="space-y-5 px-6 py-7">
            {/* Role selector */}
            <div>
              <span className="micro mb-1.5 block">role</span>
              <div className="grid grid-cols-2 gap-px border border-line bg-line">
                {(
                  [
                    { r: "participant" as UserRole, desc: "solve challenges" },
                    { r: "organiser" as UserRole, desc: "run events" },
                  ]
                ).map(({ r, desc }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-4 py-3 text-left transition-colors ${
                      role === r ? "bg-primary/10" : "bg-panel hover:bg-panel-2"
                    }`}
                  >
                    <span className={`block text-sm ${role === r ? "text-primary" : "text-foreground"}`}>
                      {r}
                    </span>
                    <span className="block text-[12px] text-muted-foreground">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="micro mb-1.5 block">name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint"
                required
              />
            </div>
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
              <label htmlFor="phone" className="micro mb-1.5 block">
                phone <span className="normal-case text-faint">(optional)</span>
              </label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 1234"
                className="w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint"
              />
            </div>
            <div>
              <label htmlFor="password" className="micro mb-1.5 block">password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 6 characters"
                minLength={6}
                className="w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 border border-primary bg-primary/10 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
            >
              {submitting && <Spinner />} $ t6 register
            </button>
            <p className="text-center text-[13px] text-muted-foreground">
              already registered?{" "}
              <Link href="/signin" className="text-primary hover:underline">sign in</Link>
            </p>
          </form>
        </Panel>

        {role === "organiser" && (
          <div className="mt-4 border border-line bg-panel/50 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
            <Chip tone="amber">organiser</Chip>{" "}
            You'll get the host console: create events, set the flag format, load
            challenges and watch the leaderboard fill up.
          </div>
        )}
      </main>
    </AppShell>
  )
}
