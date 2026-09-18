"use client"

import { AppShell } from "@/components/app-shell"
import { useAuth } from "@/components/auth-provider"
import { Chip, EmptyState, LoadingRows, Panel, PanelHeader, PhaseDot, Spinner } from "@/components/ui-kit"
import { api } from "@/lib/api"
import { eventPhase, formatDateTime, useCountdown, useNow } from "@/lib/hooks"
import {
  ApiError,
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
  Event,
  Submission,
} from "@/lib/types"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

const CATEGORIES: (ChallengeCategory | "all")[] = ["all", "web", "crypto", "reverse", "forensics", "pwn", "osint", "misc"]
const DIFFICULTIES: (ChallengeDifficulty | "all")[] = ["all", "easy", "medium", "hard", "insane"]

const DIFF_TONE: Record<ChallengeDifficulty, string> = {
  easy: "text-ok",
  medium: "text-primary",
  hard: "text-danger",
  insane: "text-danger",
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

export default function EventPlayPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [event, setEvent] = useState<Event | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selected, setSelected] = useState<Challenge | null>(null)
  const [category, setCategory] = useState<ChallengeCategory | "all">("all")
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty | "all">("all")
  const [search, setSearch] = useState("")

  const [flag, setFlag] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [hintOpen, setHintOpen] = useState(false)

  const now = useNow(30000)
  const phase = event ? eventPhase(event) : null
  const startsIn = useCountdown(event?.start_time ?? null, "starts")

  const loadEvent = useCallback(async () => {
    try {
      const e = await api.get<Event>(`/events/${id}`)
      setEvent(e)
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Failed to load event")
    }
  }, [id])

  const loadChallenges = useCallback(async () => {
    try {
      const list = await api.get<Challenge[]>(`/events/${id}/challenges`)
      setChallenges(list)
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Failed to load challenges")
    }
  }, [id])

  const loadSolves = useCallback(async () => {
    if (!user) return
    try {
      const solves = await api.get<{ challenge_id: string }[]>("/auth/me/solves")
      setSolvedIds(new Set(solves.map((s) => s.challenge_id)))
    } catch {
      /* solved state is cosmetic on this page */
    }
  }, [user])

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading && !user) setLoading(false)
      return
    }
    Promise.all([loadEvent(), loadChallenges(), loadSolves()]).finally(() =>
      setLoading(false),
    )
  }, [authLoading, user, loadEvent, loadChallenges, loadSolves])

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

  const solvedCount = challenges.filter((c) => solvedIds.has(c.id)).length
  const earned = challenges
    .filter((c) => solvedIds.has(c.id))
    .reduce((sum, c) => sum + c.points, 0)

  function pick(challenge: Challenge) {
    setSelected(challenge)
    setFlag("")
    setWrong(false)
    setHintOpen(false)
    setSubmissions([])
    api
      .get<Submission[]>(`/challenges/${challenge.id}/submissions`)
      .then(setSubmissions)
      .catch(() => setSubmissions([]))
  }

  async function submitFlag(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !flag.trim()) return
    setSubmitting(true)
    setWrong(false)
    try {
      const res = await api.post<{ is_correct: boolean; points_awarded: number }>(
        `/challenges/${selected.id}/submit`,
        { flag },
      )
      if (res.is_correct) {
        toast.success(`Solved — +${res.points_awarded} pts`)
        setSolvedIds((prev) => new Set(prev).add(selected.id))
      } else {
        setWrong(true)
        toast.error("Wrong flag.")
      }
      api
        .get<Submission[]>(`/challenges/${selected.id}/submissions`)
        .then(setSubmissions)
        .catch(() => {})
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.info("Already solved.")
        } else if (err.status === 401) {
          router.push("/signin")
        } else {
          toast.error(err.message)
          setWrong(true)
        }
      } else {
        toast.error("Submission failed — is the API running?")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!authLoading && !user) {
    return (
      <AppShell>
        <main className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
          <EmptyState
            title="Sign in to play."
            hint="Challenges and submissions are live data — they need an account."
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

  if (loading) {
    return (
      <AppShell>
        <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
          <LoadingRows rows={6} />
        </main>
      </AppShell>
    )
  }

  if (loadError || !event) {
    return (
      <AppShell>
        <main className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
          <EmptyState
            title={loadError ?? "Event not found."}
            action={
              <Link href="/events" className="border border-line px-5 py-2 text-sm text-muted-foreground hover:text-foreground">
                ← back to events
              </Link>
            }
          />
        </main>
      </AppShell>
    )
  }

  const isOrganiser = user?.id === event.created_by

  return (
    <AppShell>
      <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        {/* Event header */}
        <div className="mb-6">
          <Link href="/events" className="text-[12px] text-faint hover:text-muted-foreground">
            ← events
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="font-display text-3xl font-bold text-foreground">{event.name}</h1>
            <span className="flex items-center gap-2">
              <PhaseDot phase={phase!} />
              <Chip tone={phase === "live" ? "ok" : phase === "upcoming" ? "info" : "dim"}>
                {phase}
              </Chip>
            </span>
            {event.flag_format && (
              <Chip tone="amber">format {event.flag_format}…</Chip>
            )}
          </div>
          {event.description && (
            <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-faint">
            <span>
              {formatDateTime(event.start_time)} → {formatDateTime(event.end_time)}
            </span>
            <span>{event.participant_count} players</span>
            <span>
              {solvedCount}/{challenges.length} solved
            </span>
            <span>
              <span className="text-ok">{earned}</span> / {event.total_points} pts
            </span>
            {phase === "upcoming" && startsIn && <span className="text-info">starts in {startsIn}</span>}
            <Link href={`/leaderboard?event=${event.id}`} className="text-primary hover:underline">
              leaderboard →
            </Link>
          </div>
        </div>

        {/* Registration gate */}
        {!event.is_registered && phase !== "ended" && !isOrganiser && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-primary/40 bg-primary/5 px-5 py-4">
            <p className="text-[14px] text-foreground">
              You're not registered. Registration is required to submit flags.
            </p>
            <button
              onClick={async () => {
                try {
                  await api.post(`/events/${event.id}/register`)
                  toast.success(`Registered for ${event.name}`)
                  loadEvent()
                } catch (e) {
                  toast.error(e instanceof ApiError ? e.message : "Registration failed")
                }
              }}
              className="border border-primary bg-primary/10 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              register
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Challenge directory */}
          <Panel className="self-start">
            <PanelHeader
              label={`challenges · ${filtered.length}`}
              right={
                <span className="text-ok">
                  {solvedCount} solved
                </span>
              }
            />
            <div className="flex flex-wrap gap-2 border-b border-line px-3 py-2.5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="/ filter"
                className="w-24 flex-1 border border-input bg-background px-2 py-1 text-[12px] text-foreground placeholder:text-faint"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ChallengeCategory | "all")}
                className="border border-input bg-background px-1.5 py-1 text-[12px] text-muted-foreground"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ChallengeDifficulty | "all")}
                className="border border-input bg-background px-1.5 py-1 text-[12px] text-muted-foreground"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                nothing matches.
              </p>
            ) : (
              <div>
                {filtered.map((challenge, i) => {
                  const solved = solvedIds.has(challenge.id)
                  const active = selected?.id === challenge.id
                  return (
                    <button
                      key={challenge.id}
                      onClick={() => pick(challenge)}
                      className={`trow flex w-full items-center gap-3 px-4 py-3 text-left ${
                        active ? "bg-panel-2" : ""
                      }`}
                    >
                      <span className="text-[11px] text-faint">
                        {pad2(i + 1)}
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate text-[13.5px] ${
                          solved ? "text-ok" : active ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {challenge.title}
                        <span className="text-faint">.{challenge.category}</span>
                      </span>
                      {solved && <span className="text-[11px] text-ok">✓</span>}
                      <span className={`text-[12px] ${DIFF_TONE[challenge.difficulty]}`}>
                        {challenge.points}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </Panel>

          {/* Detail pane */}
          <div>
            {!selected ? (
              <EmptyState
                title="Select a challenge."
                hint="Solved ones stay green. Points are listed on the right."
              />
            ) : (
              <Panel className="fade-up">
                <PanelHeader
                  label={`${selected.category} · ${selected.difficulty} · ${selected.points} pts`}
                  right={
                    solvedIds.has(selected.id) ? (
                      <span className="text-ok">✓ solved</span>
                    ) : (
                      <span className="text-faint">open</span>
                    )
                  }
                />
                <div className="px-5 py-5">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    {selected.title}
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-muted-foreground">
                    {selected.description}
                  </p>

                  {selected.connection_url && (
                    <a
                      href={selected.connection_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 border border-info/50 px-3 py-1.5 text-[13px] text-info transition-colors hover:bg-info/10"
                    >
                      ↗ open live service · {selected.connection_url.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  {selected.attachment_url && (
                    <a
                      href={selected.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 inline-flex items-center gap-2 border border-line px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      ↓ attachment
                    </a>
                  )}

                  {selected.flag_hint && (
                    <div className="mt-4">
                      {hintOpen ? (
                        <p className="border border-line bg-panel-2 px-4 py-3 text-[13px] text-primary">
                          hint · {selected.flag_hint}
                        </p>
                      ) : (
                        <button
                          onClick={() => setHintOpen(true)}
                          className="text-[12px] text-faint underline decoration-dotted hover:text-muted-foreground"
                        >
                          reveal hint (points don't change)
                        </button>
                      )}
                    </div>
                  )}

                  {/* Flag submission */}
                  <form onSubmit={submitFlag} className="mt-6">
                    <label className="micro mb-1.5 block">
                      submit flag{event.flag_format ? ` · must start with ${event.flag_format}` : ""}
                    </label>
                    <div className="flex">
                      <input
                        value={flag}
                        onChange={(e) => {
                          setFlag(e.target.value)
                          setWrong(false)
                        }}
                        placeholder={event.flag_format ? `${event.flag_format}…}` : "flag{…}"}
                        disabled={
                          solvedIds.has(selected.id) ||
                          phase === "ended" ||
                          (!event.is_registered && !isOrganiser)
                        }
                        className={`min-w-0 flex-1 border px-3 py-2 text-sm text-foreground placeholder:text-faint disabled:opacity-40 ${
                          wrong ? "border-danger" : "border-input"
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={
                          submitting ||
                          !flag.trim() ||
                          solvedIds.has(selected.id) ||
                          phase === "ended" ||
                          (!event.is_registered && !isOrganiser)
                        }
                        className="flex items-center gap-2 border border-primary bg-primary/10 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {submitting && <Spinner />} submit
                      </button>
                    </div>
                    {wrong && (
                      <p className="mt-2 text-[12px] text-danger">
                        rejected — check the format and try again. every attempt is logged.
                      </p>
                    )}
                    {phase === "ended" && (
                      <p className="mt-2 text-[12px] text-faint">
                        event has ended — submissions are closed.
                      </p>
                    )}
                  </form>

                  {/* My attempts */}
                  {submissions.length > 0 && (
                    <div className="mt-6">
                      <div className="rule-label mb-3">my attempts</div>
                      <div className="max-h-40 space-y-px overflow-y-auto">
                        {submissions.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between border-b border-line px-1 py-1.5 text-[12px] last:border-b-0"
                          >
                            <span className={s.is_correct ? "text-ok" : "text-muted-foreground"}>
                              {s.is_correct ? "✓" : "✗"} {s.submitted_flag}
                            </span>
                            <span className="text-faint">
                              {new Date(s.submitted_at).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  )
}
