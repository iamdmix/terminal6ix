"use client"

import { AppShell } from "@/components/app-shell"
import { useAuth } from "@/components/auth-provider"
import { Chip, EmptyState, LoadingRows, Panel, PanelHeader, PhaseDot, Spinner } from "@/components/ui-kit"
import { api } from "@/lib/api"
import { eventPhase, timeAgo, useEvents, usePoll } from "@/lib/hooks"
import { ApiError, LeaderboardEntry } from "@/lib/types"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length < 3) return null
  const places = [
    { entry: entries[1], medal: "2", cls: "md:order-1 md:mt-8" },
    { entry: entries[0], medal: "1", cls: "md:order-2" },
    { entry: entries[2], medal: "3", cls: "md:order-3 md:mt-12" },
  ]
  return (
    <div className="mb-6 grid gap-3 md:grid-cols-3">
      {places.map(({ entry, medal, cls }) => (
        <div
          key={entry.user_id}
          className={`border bg-panel px-5 py-5 ${
            medal === "1" ? "border-primary/60" : "border-line"
          } ${cls}`}
        >
          <div className="flex items-baseline justify-between">
            <span
              className={`font-display text-3xl font-bold ${
                medal === "1" ? "text-primary" : "text-faint"
              }`}
            >
              {medal}
            </span>
            <span className="text-[12px] text-muted-foreground">
              {entry.score.toLocaleString()} pts
            </span>
          </div>
          <div className="mt-1 truncate font-display text-lg font-semibold text-foreground">
            {entry.user_name}
          </div>
          <div className="mt-0.5 text-[12px] text-faint">
            {entry.solved_count} solved · last {timeAgo(entry.last_solve_at)}
          </div>
        </div>
      ))}
    </div>
  )
}

function LeaderboardInner() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const { events, loading: eventsLoading } = useEvents()

  const requested = params.get("event")
  const [selectedId, setSelectedId] = useState<string | null>(requested)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!selectedId && events.length > 0) {
      const live = events.find((e) => eventPhase(e) === "live") ?? events[0]
      setSelectedId(live.id)
    }
  }, [events, selectedId])

  const loadBoard = useCallback(
    async (eventId: string, spinner = true) => {
      if (spinner) setRefreshing(true)
      try {
        setEntries(await api.get<LeaderboardEntry[]>(`/events/${eventId}/leaderboard`))
      } catch (e) {
        toast.error(e instanceof ApiError ? e.message : "Failed to load leaderboard")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (selectedId) {
      setLoading(true)
      loadBoard(selectedId, false)
    }
  }, [selectedId, loadBoard])

  usePoll(() => selectedId && loadBoard(selectedId, false), 15000, !!selectedId)

  if (!authLoading && !user) {
    return (
      <AppShell>
        <main className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
          <EmptyState
            title="Leaderboards need an account."
            hint="Sign in to see per-event rankings as they update."
            action={
              <button
                onClick={() => router.push("/signin")}
                className="border border-primary bg-primary/10 px-5 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
              >
                sign in
              </button>
            }
          />
        </main>
      </AppShell>
    )
  }

  const selectedEvent = events.find((e) => e.id === selectedId)
  const myEntry = entries.find((e) => e.user_id === user?.id)

  return (
    <AppShell>
      <main className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Leaderboard</h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Rescored on every accepted flag · auto-refresh 15s
              {refreshing && <Spinner className="ml-2 align-middle" />}
            </p>
          </div>
          {selectedEvent && (
            <div className="hidden items-center gap-2 sm:flex">
              <PhaseDot phase={eventPhase(selectedEvent)} />
              <span className="text-[12px] text-muted-foreground">
                {eventPhase(selectedEvent) === "live" ? "scoring live" : eventPhase(selectedEvent)}
              </span>
            </div>
          )}
        </div>

        {/* Event tabs */}
        {eventsLoading ? (
          <LoadingRows rows={1} />
        ) : events.length === 0 ? (
          <EmptyState title="No events yet." hint="Rankings appear once events exist." />
        ) : (
          <div className="mb-8 flex flex-wrap gap-2">
            {events.map((event) => {
              const active = event.id === selectedId
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedId(event.id)}
                  className={`flex items-center gap-2 border px-3.5 py-1.5 text-[13px] transition-colors ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-line text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <PhaseDot phase={eventPhase(event)} />
                  {event.name}
                </button>
              )
            })}
          </div>
        )}

        {selectedEvent && (
          <div className="mb-6 flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-faint">
            <span>{selectedEvent.participant_count} players</span>
            <span>{selectedEvent.challenge_count} challenges</span>
            <span>{selectedEvent.total_points} pts total</span>
          </div>
        )}

        {loading ? (
          <LoadingRows rows={5} />
        ) : entries.length === 0 ? (
          <EmptyState
            title="No solves yet."
            hint="First accepted flag takes rank 1 — it could be yours."
            action={
              selectedEvent && (
                <button
                  onClick={() => router.push(`/events/${selectedEvent.id}`)}
                  className="border border-primary bg-primary/10 px-5 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
                >
                  enter {selectedEvent.name} →
                </button>
              )
            }
          />
        ) : (
          <>
            <Podium entries={entries} />
            <Panel>
              <PanelHeader label={`rankings · ${entries.length}`} />
              <div>
                {entries.map((entry) => {
                  const mine = entry.user_id === user?.id
                  return (
                    <div
                      key={entry.user_id}
                      className={`trow grid grid-cols-[3rem_1fr_5rem_5rem_6rem] items-center px-4 py-3 sm:grid-cols-[3rem_1fr_7rem_6rem_7rem] ${
                        mine ? "bg-primary/5" : ""
                      }`}
                    >
                      <span
                        className={`font-display text-lg font-semibold ${
                          entry.rank === 1
                            ? "text-primary"
                            : entry.rank <= 3
                              ? "text-foreground"
                              : "text-faint"
                        }`}
                      >
                        {String(entry.rank).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 truncate text-[14px] text-foreground">
                        {entry.user_name}
                        {mine && <Chip tone="amber" className="ml-2">you</Chip>}
                      </span>
                      <span className="text-right text-[14px] text-primary">
                        {entry.score.toLocaleString()}
                      </span>
                      <span className="text-right text-[13px] text-muted-foreground">
                        {entry.solved_count}
                      </span>
                      <span className="text-right text-[12px] text-faint">
                        {timeAgo(entry.last_solve_at)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Panel>
          </>
        )}

        {myEntry && (
          <p className="mt-4 text-[13px] text-muted-foreground">
            you: rank <span className="text-primary">#{myEntry.rank}</span> ·{" "}
            {myEntry.score.toLocaleString()} pts · {myEntry.solved_count} solved
          </p>
        )}
      </main>
    </AppShell>
  )
}

export default function LeaderboardPage() {
  return (
    <Suspense>
      <LeaderboardInner />
    </Suspense>
  )
}
