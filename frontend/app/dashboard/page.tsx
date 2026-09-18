"use client"

import { AppShell } from "@/components/app-shell"
import { useAuth } from "@/components/auth-provider"
import { Chip, EmptyState, LoadingRows, Panel, PanelHeader, PhaseDot, Stat } from "@/components/ui-kit"
import { api } from "@/lib/api"
import { eventPhase, formatDateTime, timeAgo, useEvents, useMySolves } from "@/lib/hooks"
import { Challenge, Event, Solve } from "@/lib/types"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

interface EventProgress {
  event: Event
  solved: number
  points: number
  total: number
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { events, loading: eventsLoading } = useEvents()
  const { solves, loading: solvesLoading } = useMySolves()

  const [challengesByEvent, setChallengesByEvent] = useState<Record<string, Challenge[]>>({})

  const mine = useMemo(() => events.filter((e) => e.is_registered), [events])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const results = await Promise.all(
        mine.map(async (e) => {
          try {
            return [e.id, await api.get<Challenge[]>(`/events/${e.id}/challenges`)] as const
          } catch {
            return [e.id, [] as Challenge[]] as const
          }
        }),
      )
      if (!cancelled) setChallengesByEvent(Object.fromEntries(results))
    }
    if (mine.length > 0) load()
    return () => {
      cancelled = true
    }
  }, [mine])

  const progress: EventProgress[] = useMemo(
    () =>
      mine.map((event) => {
        const challenges = challengesByEvent[event.id] ?? []
        const solved = challenges.filter((c) => solves.some((s) => s.challenge_id === c.id))
        return {
          event,
          solved: solved.length,
          points: solved.reduce((sum, c) => sum + c.points, 0),
          total: event.total_points,
        }
      }),
    [mine, challengesByEvent, solves],
  )

  if (!authLoading && !user) {
    return (
      <AppShell>
        <main className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
          <EmptyState
            title="Your dashboard lives behind sign-in."
            hint="Track every event you're registered for, in one place."
            action={
              <Link
                href="/signin"
                className="border border-primary bg-primary/10 px-5 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
              >
                sign in
              </Link>
            }
          />
        </main>
      </AppShell>
    )
  }

  const loading = eventsLoading || solvesLoading
  const totalPoints = progress.reduce((sum, p) => sum + p.points, 0)
  const totalSolved = progress.reduce((sum, p) => sum + p.solved, 0)
  const recent = solves.slice(0, 8)

  return (
    <AppShell>
      <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            <span className="text-faint">~/</span>{user?.name.toLowerCase().replace(/\s+/g, "-")}
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Your events, your points, your pace.
          </p>
        </div>

        {loading ? (
          <LoadingRows rows={5} />
        ) : progress.length === 0 ? (
          <EmptyState
            title="You're not registered for any events."
            hint="Pick one from the events index — most have live challenges right now."
            action={
              <Link
                href="/events"
                className="border border-primary bg-primary/10 px-5 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
              >
                browse events →
              </Link>
            }
          />
        ) : (
          <>
            {/* Summary */}
            <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="events" value={progress.length} />
              <Stat label="challenges solved" value={totalSolved} tone="ok" />
              <Stat label="points earned" value={totalPoints.toLocaleString()} tone="amber" />
              <Stat
                label="solve rate"
                value={`${Math.round((totalSolved / Math.max(1, progress.reduce((s, p) => s + (challengesByEvent[p.event.id] ?? []).length, 0))) * 100)}%`}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
              {/* Per-event progress */}
              <Panel className="self-start">
                <PanelHeader label="events" />
                <div>
                  {progress.map(({ event, solved, points, total }) => {
                    const phase = eventPhase(event)
                    const pct = Math.round((points / Math.max(1, total)) * 100)
                    return (
                      <div key={event.id} className="trow px-4 py-4">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <PhaseDot phase={phase} />
                          <Link
                            href={`/events/${event.id}`}
                            className="font-display text-[15px] font-semibold text-foreground hover:text-primary"
                          >
                            {event.name}
                          </Link>
                          <Chip tone={phase === "live" ? "ok" : phase === "upcoming" ? "info" : "dim"}>
                            {phase}
                          </Chip>
                        </div>
                        <div className="mt-2.5 h-1 w-full bg-panel-2">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-1.5 flex justify-between text-[12px] text-faint">
                          <span>
                            {solved}/{challengesByEvent[event.id]?.length ?? 0} solved
                          </span>
                          <span>
                            <span className="text-primary">{points.toLocaleString()}</span> /{" "}
                            {total.toLocaleString()} pts · {pct}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Panel>

              {/* Recent solves */}
              <Panel className="self-start">
                <PanelHeader label="recent solves" />
                {recent.length === 0 ? (
                  <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                    no solves yet — the first flag is out there.
                  </p>
                ) : (
                  <div>
                    {recent.map((solve: Solve) => (
                      <div
                        key={solve.id}
                        className="trow flex items-center justify-between px-4 py-2.5"
                      >
                        <span className="text-[13px] text-foreground">
                          <span className="text-ok">✓</span> +{solve.points_awarded} pts
                        </span>
                        <span className="text-[12px] text-faint">{timeAgo(solve.submitted_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>

            <p className="mt-6 text-[12px] text-faint">
              member since — · data refreshed {formatDateTime(new Date().toISOString())}
            </p>
          </>
        )}
      </main>
    </AppShell>
  )
}
