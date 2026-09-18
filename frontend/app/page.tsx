"use client"

import { AppShell } from "@/components/app-shell"
import { useAuth } from "@/components/auth-provider"
import { Panel } from "@/components/ui-kit"
import { api } from "@/lib/api"
import { useTypewriter } from "@/lib/hooks"
import type { PlatformStats } from "@/lib/types"
import Link from "next/link"
import { useEffect, useState } from "react"

const SESSION_LINES = [
  "$ t6 login player@terminal6ix.dev",
  "  ✓ authenticated · role: participant",
  "$ t6 events --live",
  "  ● TerminalSix Open 2026 · 7 challenges · 2175 pts",
  "$ t6 submit --challenge cookie-monster",
  "  flag › T6{cookies_are_not_secure}",
  "  ✓ correct · +100 pts · rank ↑ 4",
  "$ _",
]

function Terminal() {
  const { output, done } = useTypewriter(SESSION_LINES, 26, 800)
  return (
    <Panel className="w-full">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-faint" />
        <span className="h-2.5 w-2.5 rounded-full bg-faint" />
        <span className="micro ml-2">t6 — session</span>
        <span className="micro ml-auto">80×24</span>
      </div>
      <div className="h-[248px] overflow-hidden px-5 py-4 text-[13px] leading-[1.75]">
        {output.map((line, i) => (
          <div
            key={i}
            className={
              line.startsWith("  ✓")
                ? "text-ok"
                : line.startsWith("  ●")
                  ? "text-info"
                  : line.startsWith("  flag")
                    ? "text-primary"
                    : line.startsWith("$")
                      ? "text-foreground"
                      : "text-muted-foreground"
            }
          >
            {i === output.length - 1 && !done ? <span className="cursor">{line}</span> : line || "\u00A0"}
          </div>
        ))}
      </div>
    </Panel>
  )
}

function LiveStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  useEffect(() => {
    api
      .get<PlatformStats>("/stats")
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  const items = [
    { label: "players registered", value: stats?.users ?? "—" },
    { label: "events hosted", value: stats?.events ?? "—" },
    { label: "challenges live", value: stats?.challenges ?? "—" },
    { label: "flags captured", value: stats?.flags_captured ?? "—" },
  ]

  return (
    <div className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="bg-panel px-4 py-5 text-center">
          <div className="font-display text-3xl font-semibold text-primary">
            {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
          </div>
          <div className="micro mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

const FLOW = [
  {
    cmd: "01",
    title: "Register for an event",
    body: "Browse live and upcoming events, pick one, and you're in. Every event states its flag format up front — no guessing.",
  },
  {
    cmd: "02",
    title: "Solve, don't guess",
    body: "Challenges span web, crypto, pwn, forensics, reverse and OSINT. Some run as live dockerised services. Hints exist, points don't wait.",
  },
  {
    cmd: "03",
    title: "Watch the board move",
    body: "The leaderboard re-scores on every accepted flag. Ties break by who solved first. Auto-refresh keeps it honest.",
  },
]

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <AppShell>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-4 pb-20 pt-16 sm:px-6 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="micro mb-5 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-ok" />
              capture the flag · done properly
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.08] text-foreground sm:text-5xl">
              Break things.
              <br />
              <span className="text-primary">Capture flags.</span>
              <br />
              Climb the board.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              TerminalSix is a CTF platform for people who'd rather solve than scroll.
              Live events, real scoring, dockerised challenges — and a leaderboard
              that doesn't lie.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link
                  href="/events"
                  className="border border-primary bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  Browse events →
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="border border-primary bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    Create an account
                  </Link>
                  <Link
                    href="/signin"
                    className="border border-line px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:border-faint hover:text-foreground"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
          <Terminal />
        </div>
      </section>

      {/* Live stats */}
      <section className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
        <div className="rule-label mb-6">live from the platform</div>
        <LiveStats />
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
        <div className="rule-label mb-6">how an event runs</div>
        <div className="grid gap-px border border-line bg-line md:grid-cols-3">
          {FLOW.map((step) => (
            <div key={step.cmd} className="bg-panel px-6 py-8">
              <div className="mb-4 font-mono text-xs text-faint">
                [{step.cmd}]
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Organiser pitch */}
      <section className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6">
        <Panel>
          <div className="grid gap-0 md:grid-cols-[1fr_auto]">
            <div className="px-6 py-8 md:px-10 md:py-10">
              <div className="micro mb-3">for organisers</div>
              <h2 className="mb-3 font-display text-2xl font-semibold text-foreground">
                Run your CTF without duct tape
              </h2>
              <p className="max-w-lg text-[14px] leading-relaxed text-muted-foreground">
                Create an event, set its flag format, load challenges with points and
                hints, and share the room. Registration, submissions, scoring and the
                live leaderboard are handled. You watch the board.
              </p>
              <ul className="mt-5 space-y-1.5 text-[13px] text-muted-foreground">
                <li><span className="text-primary">›</span> per-event flag formats (e.g. <span className="text-foreground">T6{"{"}</span>, <span className="text-foreground">dad{"{"}</span>)</li>
                <li><span className="text-primary">›</span> seven categories, four difficulty tiers, hints you control</li>
                <li><span className="text-primary">›</span> every submission logged — wrong attempts included</li>
              </ul>
            </div>
            <div className="flex items-center border-t border-line px-10 py-8 md:border-l md:border-t-0">
              <Link
                href="/host"
                className="border border-line px-5 py-2.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Open the host console
              </Link>
            </div>
          </div>
        </Panel>
      </section>

      <footer className="border-t border-line py-8 text-center text-[12px] text-faint">
        terminal6ix — built for hackers, run by organisers ·{" "}
        <Link href="/events" className="hover:text-muted-foreground">events</Link>
      </footer>
    </AppShell>
  )
}
