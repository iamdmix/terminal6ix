"use client"

import { useAuth } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { eventStatus, formatDateTime, useEvents } from "@/lib/hooks"
import { ApiError, LeaderboardEntry } from "@/lib/types"
import { Award, Lock, Medal, RefreshCw, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
  if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />
  return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{rank}</span>
}

function timeAgo(iso: string | null) {
  if (!iso) return "—"
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { events, loading: eventsLoading } = useEvents()

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [challengeCount, setChallengeCount] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  const loadBoard = useCallback(
    async (eventId: string, showSpinner = true) => {
      if (showSpinner) setRefreshing(true)
      try {
        const board = await api.get<LeaderboardEntry[]>(`/events/${eventId}/leaderboard`)
        setEntries(board)
        if (selectedEvent) {
          setChallengeCount(selectedEvent.challenge_count)
          setTotalPoints(selectedEvent.total_points)
        }
      } catch (e) {
        toast.error(e instanceof ApiError ? e.message : "Failed to load leaderboard")
      } finally {
        if (showSpinner) setRefreshing(false)
        setLoading(false)
      }
    },
    [selectedEvent],
  )

  // Auto-select the first live event
  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      const live = events.find((e) => eventStatus(e).label === "Live") || events[0]
      setSelectedEventId(live.id)
    }
  }, [events, selectedEventId])

  // Load on selection + poll every 15s for live updates
  useEffect(() => {
    if (!selectedEventId) return
    setLoading(true)
    loadBoard(selectedEventId, false)
    const timer = setInterval(() => loadBoard(selectedEventId, false), 15000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId])

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-md mx-auto px-6 py-32 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Sign in to view leaderboards</h1>
          <p className="text-muted-foreground mb-8">
            Live rankings are per-event and require authentication.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/signin")} className="text-primary hover:underline">
              Sign In
            </button>
            <button onClick={() => router.push("/signup")} className="text-primary hover:underline">
              Create Account
            </button>
          </div>
        </main>
      </div>
    )
  }

  const myEntry = entries.find((e) => e.user_id === user?.id)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Live{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time rankings — auto-refreshes every 15 seconds.
          </p>
        </div>

        {/* Event selector */}
        {eventsLoading ? (
          <div className="flex justify-center gap-3 mb-10">
            <Skeleton className="h-10 w-64" /><Skeleton className="h-10 w-64" />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {events.map((event) => {
              const status = eventStatus(event)
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`px-4 py-2 rounded-full border text-sm transition-colors flex items-center gap-2 ${
                    event.id === selectedEventId
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    status.label === "Live" ? "bg-green-500 animate-pulse" : status.label === "Upcoming" ? "bg-blue-500" : "bg-gray-500"
                  }`} />
                  {event.name}
                </button>
              )
            })}
            {events.length === 0 && <p className="text-muted-foreground">No events yet.</p>}
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{entries.length}</div>
            <div className="text-sm text-muted-foreground">Competitors</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-2">{challengeCount}</div>
            <div className="text-sm text-muted-foreground">Challenges</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-2">
              {selectedEvent ? eventStatus(selectedEvent).label : "—"}
            </div>
            <div className="text-sm text-muted-foreground">Event Status</div>
          </div>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {selectedEvent?.name || "Rankings"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {selectedEvent && `${formatDateTime(selectedEvent.start_time)} → ${formatDateTime(selectedEvent.end_time)}`}
                </p>
              </div>
              <button
                onClick={() => selectedEventId && loadBoard(selectedEventId)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No solves yet — be the first to capture a flag!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-foreground">Rank</th>
                      <th className="text-left p-4 font-semibold text-foreground">Player</th>
                      <th className="text-left p-4 font-semibold text-foreground">Score</th>
                      <th className="text-left p-4 font-semibold text-foreground">Solved</th>
                      <th className="text-left p-4 font-semibold text-foreground">Last Solve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr
                        key={entry.user_id}
                        className={`border-b border-border transition-colors ${
                          entry.user_id === user?.id ? "bg-primary/5" : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">{getRankIcon(entry.rank)}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-foreground">
                            {entry.user_name}
                            {entry.user_id === user?.id && (
                              <Badge variant="outline" className="ml-2 border-primary/40 text-primary">you</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-primary text-lg">{entry.score.toLocaleString()}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{entry.solved_count} challenges</Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-muted-foreground">{timeAgo(entry.last_solve_at)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Your stats */}
        {myEntry && (
          <div className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Your Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">#{myEntry.rank}</div>
                <div className="text-sm text-muted-foreground">Current Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{myEntry.score}</div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{myEntry.solved_count}</div>
                <div className="text-sm text-muted-foreground">Challenges Solved</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
