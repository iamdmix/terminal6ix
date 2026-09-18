"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "@/lib/api"
import type { Event, Solve } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"

/* ------------------------------------------------------------------ */
/* Events                                                             */
/* ------------------------------------------------------------------ */

export function useEvents(enabled = true) {
  const { user, loading: authLoading } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const active = enabled && !!user

  const refresh = useCallback(async () => {
    if (!active) {
      setLoading(false)
      return
    }
    try {
      setError(null)
      setEvents(await api.get<Event[]>("/events/"))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events")
    } finally {
      setLoading(false)
    }
  }, [active])

  useEffect(() => {
    if (!authLoading) refresh()
  }, [authLoading, refresh])

  return { events, loading, error, refresh }
}

export function useMySolves(enabled = true) {
  const { user, loading: authLoading } = useAuth()
  const [solves, setSolves] = useState<Solve[]>([])
  const [loading, setLoading] = useState(true)
  const active = enabled && !!user

  const refresh = useCallback(async () => {
    if (!active) {
      setLoading(false)
      return
    }
    try {
      setSolves(await api.get<Solve[]>("/auth/me/solves"))
    } catch {
      setSolves([])
    } finally {
      setLoading(false)
    }
  }, [active])

  useEffect(() => {
    if (!authLoading) refresh()
  }, [authLoading, refresh])

  return { solves, loading, refresh }
}

/* ------------------------------------------------------------------ */
/* Time                                                               */
/* ------------------------------------------------------------------ */

export type EventPhase = "upcoming" | "live" | "ended"

export function eventPhase(event: Event): EventPhase {
  const now = Date.now()
  if (now < new Date(event.start_time).getTime()) return "upcoming"
  if (now > new Date(event.end_time).getTime()) return "ended"
  return "live"
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

/** Countdown string until `iso`; direction: "starts" or "ends". */
export function useCountdown(iso: string | null, direction: "starts" | "ends") {
  const now = useNow(1000)
  if (!iso) return null
  const target = new Date(iso).getTime()
  const diff = direction === "starts" ? target - now : target - now
  if (diff <= 0) return null
  const s = Math.floor(diff / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`
  return `${m}m ${String(sec).padStart(2, "0")}s`
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function timeAgo(iso: string | null) {
  if (!iso) return "—"
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/* ------------------------------------------------------------------ */
/* Terminal typewriter (hero) — disabled under reduced motion          */
/* ------------------------------------------------------------------ */

export function useTypewriter(lines: string[], speed = 34, startDelay = 500) {
  const [output, setOutput] = useState<string[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setOutput(lines)
      setDone(true)
      return
    }

    let line = 0
    let char = 0
    let timer: ReturnType<typeof setTimeout>
    const started = setTimeout(function tick() {
      if (line >= lines.length) {
        setDone(true)
        return
      }
      const current = lines[line]
      char += 1
      setOutput((prev) => {
        const next = [...prev]
        next[line] = current.slice(0, char)
        return next
      })
      if (char >= current.length) {
        line += 1
        char = 0
        timer = setTimeout(tick, speed * 6)
      } else {
        timer = setTimeout(tick, speed)
      }
    }, startDelay)

    return () => {
      clearTimeout(started)
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { output, done }
}

/** Poll an async callback on an interval. */
export function usePoll(fn: () => void, ms: number, enabled = true) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    if (!enabled) return
    const t = setInterval(() => ref.current(), ms)
    return () => clearInterval(t)
  }, [ms, enabled])
}
