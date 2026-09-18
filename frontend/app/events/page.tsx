"use client"

import { AppShell } from "@/components/app-shell"
import { useAuth } from "@/components/auth-provider"
import { Chip, EmptyState, LoadingRows, Panel, PanelHeader, PhaseDot } from "@/components/ui-kit"
import { api } from "@/lib/api"
import { eventPhase, formatDateTime, useCountdown, useEvents, useNow } from "@/lib/hooks"
import { ApiError, Event } from "@/lib/types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

function Countdown({ event }: { event: Event }) {
  const phase = eventPhase(event)
  const now = useNow(30000)
  const iso = phase === "upcoming" ? event.start_time : event.end_time
  const diff = new Date(iso).getTime() - now
  if (diff <= 0) return <span>—</span>
  const s = Math.floor(diff / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  return (
    <span>
      {phase === "upcoming" ? "starts in " : "ends in "}
      {d > 0 ? `${d}d ` : ""}
      {h}h {String(m).padStart(2, "0")}m
    </span>
  )
}

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { events, loading, refresh } = useEvents()
  const [registering, setRegistering] = useState<string | null>(null)

  async function toggleRegistration(event: Event) {
    setRegistering(event.id)
    try {
      if (event.is_registered) {
        await api.delete(`/events/${event.id}/register`)
        toast.success(`Left ${event.name}`)
      } else {
        await api.post(`/events/${event.id}/register`)
        toast.success(`Registered for ${event.name}`)
      }
      refresh()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action failed")
    } finally {
      setRegistering(null)
    }
  }

  if (!authLoading && !user) {
    return (
      <AppShell>
        <main className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
          <EmptyState
            title="Events are visible to signed-in players."
            hint="Create an account to browse, register and play."
            action={
              <>
                <button
                  onClick={() => router.push("/signup")}
                  className="border border-primary bg-primary/10 px-5 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
                >
                  sign up
                </button>
                <button
                  onClick={() => router.push("/signin")}
                  className="border border-line px-5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  sign in
                </button>
              </>
            }
          />
        </main>
      </AppShell>
    )
  }

  const order = { live: 0, upcoming: 1, ended: 2 }
  const sorted = [...events].sort(
    (a, b) => order[eventPhase(a)] - order[eventPhase(b)],
  )

  return (
    <AppShell>
      <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Events</h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Live, upcoming and finished CTFs.
            </p>
          </div>
          {user?.role === "organiser" && (
            <Link
              href="/host"
              className="border border-line px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              host console →
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingRows rows={4} />
        ) : sorted.length === 0 ? (
          <EmptyState
            title="No events yet."
            hint="Organisers create events from the host console — the first one lands here."
          />
        ) : (
          <Panel>
            <PanelHeader
              label={`${sorted.length} events`}
              right={<span>{sorted.filter((e) => eventPhase(e) === "live").length} live</span>}
            />
            <div>
              {sorted.map((event) => {
                const phase = eventPhase(event)
                return (
                  <div
                    key={event.id}
                    className="trow grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <PhaseDot phase={phase} />
                        <Link
                          href={`/events/${event.id}`}
                          className="font-display text-[16px] font-semibold text-foreground hover:text-primary"
                        >
                          {event.name}
                        </Link>
                        <Chip
                          tone={phase === "live" ? "ok" : phase === "upcoming" ? "info" : "dim"}
                        >
                          {phase}
                        </Chip>
                        {event.is_registered && <Chip tone="amber">registered</Chip>}
                      </div>
                      {event.description && (
                        <p className="mt-1.5 line-clamp-1 text-[13px] text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-faint">
                        <span>{event.challenge_count} challenges</span>
                        <span>{event.total_points} pts</span>
                        <span>{event.participant_count} players</span>
                        <span>
                          {formatDateTime(event.start_time)} → {formatDateTime(event.end_time)}
                        </span>
                        <Countdown event={event} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end">
                      <button
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="border border-line px-4 py-1.5 text-[13px] text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {phase === "ended" ? "results" : "enter"} →
                      </button>
                      {phase !== "ended" && (
                        <button
                          onClick={() => toggleRegistration(event)}
                          disabled={registering === event.id}
                          className={`border px-4 py-1.5 text-[13px] transition-colors disabled:opacity-50 ${
                            event.is_registered
                              ? "border-line text-muted-foreground hover:border-danger/50 hover:text-danger"
                              : "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                          }`}
                        >
                          {event.is_registered ? "leave" : "register"}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        )}
      </main>
    </AppShell>
  )
}
