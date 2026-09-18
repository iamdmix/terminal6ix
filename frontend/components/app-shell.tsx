"use client"

import { useAuth } from "@/components/auth-provider"
import { useCountdown, useEvents, useNow, eventPhase } from "@/lib/hooks"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

/* ------------------------------------------------------------------ */
/* Wordmark                                                           */
/* ------------------------------------------------------------------ */

export function Wordmark() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="glyph flex h-7 w-7 items-center justify-center border border-primary bg-primary/10 font-display text-sm font-bold text-primary">
        T6
      </span>
      <span className="font-display text-[15px] font-semibold tracking-[0.18em] text-foreground">
        TERMINAL<span className="text-primary">SIX</span>
      </span>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Header                                                             */
/* ------------------------------------------------------------------ */

const NAV = [
  { name: "events", href: "/events" },
  { name: "leaderboard", href: "/leaderboard" },
  { name: "dashboard", href: "/dashboard" },
  { name: "host", href: "/host" },
]

function Header() {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-[1200px] items-center gap-8 px-4 sm:px-6">
        <Wordmark />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-2.5 py-1 text-[13px] transition-colors ${
                  active
                    ? "bg-panel-2 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {loading ? (
            <span className="micro">···</span>
          ) : user ? (
            <>
              <span className="hidden text-[13px] text-muted-foreground sm:inline">
                <span className="text-faint">~$</span> whoami →{" "}
                <span className="text-foreground">{user.name}</span>
                <span className="ml-2 chip border-line text-faint">{user.role}</span>
              </span>
              <button
                onClick={() => {
                  logout()
                  router.push("/")
                }}
                className="border border-line px-2.5 py-1 text-[13px] text-muted-foreground transition-colors hover:border-danger/50 hover:text-danger"
              >
                logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="px-2.5 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                sign in
              </Link>
              <Link
                href="/signup"
                className="border border-primary bg-primary/10 px-3 py-1 text-[13px] font-medium text-primary transition-colors hover:bg-primary/20"
              >
                sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* Status bar — the signature. tmux-style session strip.              */
/* ------------------------------------------------------------------ */

function StatusBar() {
  const { user } = useAuth()
  const { events } = useEvents()
  const now = useNow(1000)
  const [apiOk, setApiOk] = useState<boolean | null>(null)
  const [clock, setClock] = useState("--:--:--")

  // UTC clock
  useEffect(() => {
    const d = new Date(now)
    setClock(
      `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")}`,
    )
  }, [now])

  // API pulse
  useEffect(() => {
    let alive = true
    const ping = () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/health`)
        .then((r) => alive && setApiOk(r.ok))
        .catch(() => alive && setApiOk(false))
    ping()
    const t = setInterval(ping, 20000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [])

  // Next deadline: soonest live end, else soonest start
  let deadline: { label: string; iso: string } | null = null
  for (const e of events) {
    const phase = eventPhase(e)
    if (phase === "live") {
      if (!deadline || new Date(e.end_time) < new Date(deadline.iso)) {
        deadline = { label: `${e.name} ends`, iso: e.end_time }
      }
    } else if (phase === "upcoming") {
      if (!deadline || new Date(e.start_time) < new Date(deadline.iso)) {
        deadline = { label: `${e.name} starts`, iso: e.start_time }
      }
    }
  }
  const countdown = useCountdown(deadline?.iso ?? null, "ends")

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-panel">
      <div className="mx-auto flex h-7 max-w-[1200px] items-center gap-4 px-4 text-[11px] tracking-wide text-faint sm:px-6">
        <span className="flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              apiOk === null ? "bg-faint" : apiOk ? "bg-ok" : "bg-danger"
            }`}
          />
          api:{apiOk === null ? "··" : apiOk ? "ok" : "down"}
        </span>
        {deadline && countdown && (
          <span className="hidden truncate sm:inline">
            <span className="text-faint">next:</span> {deadline.label} in{" "}
            <span className="text-primary">{countdown}</span>
          </span>
        )}
        <span className="ml-auto hidden md:inline">utc {clock}</span>
        <span>{user ? `${user.name.toLowerCase().replace(/\s+/g, ".")}@t6` : "guest@t6"}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Shell                                                              */
/* ------------------------------------------------------------------ */

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16">{children}</main>
      <StatusBar />
    </div>
  )
}
