"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Event, Solve } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"

export function useEvents() {
  const { user, loading: authLoading } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    if (!user) {
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
  }

  useEffect(() => {
    if (!authLoading) {
      setLoading(true)
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user])

  return { events, loading, error, refresh }
}

export function useMySolves(enabled: boolean) {
  const [solves, setSolves] = useState<Solve[]>([])
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    api
      .get<Solve[]>("/auth/me/solves")
      .then(setSolves)
      .catch(() => setSolves([]))
      .finally(() => setLoading(false))
  }, [enabled])

  return { solves, loading }
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function eventStatus(event: Event): { label: string; className: string } {
  const now = Date.now()
  const start = new Date(event.start_time).getTime()
  const end = new Date(event.end_time).getTime()
  if (now < start) return { label: "Upcoming", className: "bg-blue-500/10 text-blue-500 border-blue-500/40" }
  if (now > end) return { label: "Ended", className: "bg-muted text-muted-foreground border-border" }
  return { label: "Live", className: "bg-green-500/10 text-green-500 border-green-500/40" }
}
