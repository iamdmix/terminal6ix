"use client"

import { useAuth } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { eventStatus, formatDateTime, useEvents, useMySolves } from "@/lib/hooks"
import {
  ApiError,
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
} from "@/lib/types"
import {
  Ban,
  CheckCircle2,
  Eye,
  EyeOff,
  Flag,
  Loader2,
  Lightbulb,
  Lock,
  Search,
  Swords,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

const CATEGORIES: (ChallengeCategory | "all")[] = [
  "all", "web", "crypto", "reverse", "forensics", "pwn", "osint", "misc",
]
const DIFFICULTIES: (ChallengeDifficulty | "all")[] = ["all", "easy", "medium", "hard", "insane"]

const difficultyStyles: Record<ChallengeDifficulty, string> = {
  easy: "bg-green-500/10 text-green-500 border-green-500/40",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/40",
  hard: "bg-orange-500/10 text-orange-500 border-orange-500/40",
  insane: "bg-red-500/10 text-red-500 border-red-500/40",
}

export default function ChallengesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { events, loading: eventsLoading, refresh: refreshEvents } = useEvents()
  const { solves } = useMySolves(!!user)

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [category, setCategory] = useState<ChallengeCategory | "all">("all")
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty | "all">("all")
  const [search, setSearch] = useState("")
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [challengesLoading, setChallengesLoading] = useState(false)
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set())

  // Submit dialog state
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [flagInput, setFlagInput] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const solvedChallengeIds = useMemo(
    () => new Set(solves.map((s) => s.challenge_id)),
    [solves],
  )
  const [localSolved, setLocalSolved] = useState<Set<string>>(new Set())
  const isSolved = (id: string) => solvedChallengeIds.has(id) || localSolved.has(id)

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null

  // Load challenges when an event is selected
  useEffect(() => {
    if (!selectedEventId) return
    setChallengesLoading(true)
    api
      .get<Challenge[]>(`/events/${selectedEventId}/challenges`)
      .then(setChallenges)
      .catch((e) => {
        toast.error(e instanceof ApiError ? e.message : "Failed to load challenges")
        setChallenges([])
      })
      .finally(() => setChallengesLoading(false))
  }, [selectedEventId])

  const filtered = useMemo(
    () =>
      challenges.filter(
        (c) =>
          (category === "all" || c.category === category) &&
          (difficulty === "all" || c.difficulty === difficulty) &&
          (search === "" || c.title.toLowerCase().includes(search.toLowerCase())),
      ),
    [challenges, category, difficulty, search],
  )

  async function registerForEvent() {
    if (!selectedEvent) return
    try {
      await api.post(`/events/${selectedEvent.id}/register`)
      toast.success(`Registered for ${selectedEvent.name}!`)
      refreshEvents()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Registration failed")
    }
  }

  async function submitFlag(e: React.FormEvent) {
    e.preventDefault()
    if (!activeChallenge || !flagInput.trim()) return
    setSubmitting(true)
    try {
      const res = await api.post<{ is_correct: boolean; points_awarded: number }>(
        `/challenges/${activeChallenge.id}/submit`,
        { flag: flagInput },
      )
      if (res.is_correct) {
        toast.success(`Correct! +${res.points_awarded} points`)
        setLocalSolved((prev) => new Set(prev).add(activeChallenge.id))
      } else {
        toast.error("Wrong flag. Try again!")
      }
      setActiveChallenge(null)
      setFlagInput("")
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 409) {
          toast.info("You already solved this one!")
          setActiveChallenge(null)
        } else if (e.status === 401) {
          router.push("/signin")
        } else {
          toast.error(e.message)
        }
      } else {
        toast.error("Submission failed. Is the API running?")
      }
    } finally {
      setSubmitting(false)
    }
  }

  function toggleHint(challengeId: string) {
    setRevealedHints((prev) => {
      const next = new Set(prev)
      if (next.has(challengeId)) next.delete(challengeId)
      else next.add(challengeId)
      return next
    })
  }

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-md mx-auto px-6 py-32 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Sign in to play</h1>
          <p className="text-muted-foreground mb-8">
            Challenges, events and the leaderboard are live data — you need an account to access them.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push("/signin")} className="bg-gradient-to-r from-primary to-secondary">
              Sign In
            </Button>
            <Button variant="outline" onClick={() => router.push("/signup")}>
              Create Account
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const liveEvents = events.filter((e) => eventStatus(e).label !== "Ended")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground flex items-center gap-3">
              <Swords className="text-primary" /> Challenges
            </h1>
            <p className="text-muted-foreground mt-2">
              Pick an event, solve challenges, capture flags.
            </p>
          </div>
          {selectedEvent && (
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {solves.filter((s) => challenges.some((c) => c.id === s.challenge_id)).length}/
                {challenges.length}
              </div>
              <div className="text-sm text-muted-foreground">solved in this event</div>
            </div>
          )}
        </div>

        {/* Event selector */}
        {eventsLoading ? (
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
          </div>
        ) : events.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-12 text-center mb-10">
            <p className="text-muted-foreground mb-4">No events yet. {user?.role === "organiser" ? "Host one!" : "Check back soon."}</p>
            {user?.role === "organiser" && (
              <Button onClick={() => router.push("/host")}>Host a CTF</Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {events.map((event) => {
              const status = eventStatus(event)
              const active = event.id === selectedEventId
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`text-left rounded-xl border p-5 transition-all ${
                    active
                      ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={status.className} variant="outline">{status.label}</Badge>
                    <span className="text-sm text-muted-foreground">{event.challenge_count} challenges</span>
                  </div>
                  <div className="font-semibold text-foreground">{event.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(event.start_time)} → {formatDateTime(event.end_time)}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {selectedEvent && !selectedEvent.is_registered && (
          <div className="mb-8 flex items-center justify-between rounded-xl border border-primary/40 bg-primary/5 p-5">
            <div>
              <div className="font-medium text-foreground">You are not registered for this event</div>
              <div className="text-sm text-muted-foreground">Register to submit flags and appear on the leaderboard.</div>
            </div>
            <Button onClick={registerForEvent} className="bg-gradient-to-r from-primary to-secondary">
              Register
            </Button>
          </div>
        )}

        {selectedEvent && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search challenges..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      category === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      difficulty === d ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Challenge grid */}
            {challengesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
                No challenges match your filters.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((challenge) => {
                  const solved = isSolved(challenge.id)
                  return (
                    <div
                      key={challenge.id}
                      className={`flex flex-col rounded-xl border p-6 transition-colors ${
                        solved ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className="capitalize">{challenge.category}</Badge>
                        <Badge variant="outline" className={`capitalize ${difficultyStyles[challenge.difficulty]}`}>
                          {challenge.difficulty}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{challenge.title}</h3>
                        {solved && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                      </div>

                      <p className="text-sm text-muted-foreground flex-1">{challenge.description}</p>

                      {revealedHints.has(challenge.id) && challenge.flag_hint && (
                        <p className="text-sm text-yellow-500/90 mt-3 flex gap-2">
                          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" /> {challenge.flag_hint}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                        <div className="text-sm text-muted-foreground">
                          <span className="text-primary font-semibold">{challenge.points}</span> pts
                        </div>
                        <div className="flex gap-2">
                          {challenge.flag_hint && (
                            <Button variant="ghost" size="sm" onClick={() => toggleHint(challenge.id)}>
                              {revealedHints.has(challenge.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            disabled={solved || !selectedEvent.is_registered}
                            onClick={() => {
                              setActiveChallenge(challenge)
                              setFlagInput("")
                            }}
                            className={solved ? "" : "bg-gradient-to-r from-primary to-secondary"}
                          >
                            {solved ? (
                              <><CheckCircle2 className="w-4 h-4 mr-1" /> Solved</>
                            ) : (
                              <><Flag className="w-4 h-4 mr-1" /> Solve</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {!selectedEventId && !eventsLoading && events.length > 0 && (
          <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
            Select an event above to view its challenges.
          </div>
        )}
      </main>

      {/* Flag submission dialog */}
      <Dialog open={!!activeChallenge} onOpenChange={(open) => !open && setActiveChallenge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-primary" /> Submit flag — {activeChallenge?.title}
            </DialogTitle>
            <DialogDescription>
              Worth <span className="text-primary font-semibold">{activeChallenge?.points} points</span>. Every attempt is recorded.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitFlag} className="space-y-4">
            <Input
              placeholder="flag{...}"
              value={flagInput}
              onChange={(e) => setFlagInput(e.target.value)}
              autoFocus
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActiveChallenge(null)}>
                <Ban className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button type="submit" disabled={submitting || !flagInput.trim()} className="bg-gradient-to-r from-primary to-secondary">
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
