"use client"

import { useAuth } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError, UserRole } from "@/lib/types"
import { Loader2, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast } from "sonner"

export default function SignUpPage() {
  const { signup, user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("participant")
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    router.replace("/challenges")
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const u = await signup({
        name,
        email,
        password,
        role,
        phone: phone || undefined,
      })
      toast.success(`Account created. Welcome, ${u.name}!`)
      router.push(u.role === "organiser" ? "/host" : "/challenges")
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Something went wrong. Is the API running?",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-md mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-secondary mb-6">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground">Join events as a player or host your own.</p>
        </div>

        <form onSubmit={onSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {(["participant", "organiser"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  role === r
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="font-semibold text-foreground capitalize">{r}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {r === "participant" ? "Solve challenges, climb the leaderboard" : "Create events and challenges"}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Neo Anderson" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 1234" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-primary to-secondary"
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  )
}
