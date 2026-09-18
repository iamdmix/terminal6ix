"use client"

import { AppShell } from "@/components/app-shell"
import { useAuth } from "@/components/auth-provider"
import {
  Chip,
  EmptyState,
  LoadingRows,
  Panel,
  PanelHeader,
  PhaseDot,
  Spinner,
  Stat,
} from "@/components/ui-kit"
import { api } from "@/lib/api"
import { eventPhase, formatDateTime, useEvents } from "@/lib/hooks"
import {
  ApiError,
  ChallengeAdmin,
  ChallengeCategory,
  ChallengeDifficulty,
  Event,
  LeaderboardEntry,
} from "@/lib/types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const EMPTY_EVENT = { name: "", description: "", start_time: "", end_time: "", flag_format: "T6{" }
const EMPTY_CHALLENGE = {
  title: "",
  description: "",
  category: "misc" as ChallengeCategory,
  difficulty: "easy" as ChallengeDifficulty,
  points: 100,
  flag: "",
  flag_hint: "",
  connection_url: "",
  attachment_url: "",
}

function localInput(iso: string) {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <span className="micro mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-faint">{hint}</span>}
    </div>
  )
}

const inputCls =
  "w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint"

export default function HostPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { events, loading: eventsLoading, refresh: refreshEvents } = useEvents()
  const isOrganiser = user?.role === "organiser"

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedEvent = events.find((e) => e.id === selectedId) ?? null

  const [challenges, setChallenges] = useState<ChallengeAdmin[]>([])
  const [challengesLoading, setChallengesLoading] = useState(false)
  const [top3, setTop3] = useState<LeaderboardEntry[]>([])

  // Dialog state
  const [eventForm, setEventForm] = useState(EMPTY_EVENT)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [savingEvent, setSavingEvent] = useState(false)

  const [challengeForm, setChallengeForm] = useState(EMPTY_CHALLENGE)
  const [editingChallenge, setEditingChallenge] = useState<ChallengeAdmin | null>(null)
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [savingChallenge, setSavingChallenge] = useState(false)

  const myEvents = events.filter((e) => e.created_by === user?.id)

  const loadChallenges = useCallback(async (eventId: string) => {
    setChallengesLoading(true)
    try {
      setChallenges(await api.get<ChallengeAdmin[]>(`/events/${eventId}/challenges/all`))
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to load challenges")
      setChallenges([])
    } finally {
      setChallengesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setChallenges([])
      setTop3([])
      return
    }
    loadChallenges(selectedId)
    api
      .get<LeaderboardEntry[]>(`/events/${selectedId}/leaderboard`)
      .then((b) => setTop3(b.slice(0, 3)))
      .catch(() => setTop3([]))
  }, [selectedId, loadChallenges, events])

  /* ---------------- event CRUD ---------------- */

  function openCreateEvent() {
    setEditingEvent(null)
    setEventForm(EMPTY_EVENT)
    setShowEventForm(true)
  }

  function openEditEvent(event: Event) {
    setEditingEvent(event)
    setEventForm({
      name: event.name,
      description: event.description ?? "",
      start_time: localInput(event.start_time),
      end_time: localInput(event.end_time),
      flag_format: event.flag_format ?? "",
    })
    setShowEventForm(true)
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault()
    setSavingEvent(true)
    const payload = {
      name: eventForm.name,
      description: eventForm.description || null,
      start_time: new Date(eventForm.start_time).toISOString(),
      end_time: new Date(eventForm.end_time).toISOString(),
      flag_format: eventForm.flag_format || null,
    }
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, payload)
        toast.success("Event updated")
      } else {
        const created = await api.post<Event>("/events/", payload)
        setSelectedId(created.id)
        toast.success("Event created — now add challenges")
      }
      setShowEventForm(false)
      refreshEvents()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save event")
    } finally {
      setSavingEvent(false)
    }
  }

  async function deleteEvent(event: Event) {
    try {
      await api.delete(`/events/${event.id}`)
      toast.success(`Deleted ${event.name}`)
      if (selectedId === event.id) setSelectedId(null)
      refreshEvents()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete event")
    }
  }

  /* ---------------- challenge CRUD ---------------- */

  function openCreateChallenge() {
    setEditingChallenge(null)
    setChallengeForm({ ...EMPTY_CHALLENGE, flag: selectedEvent?.flag_format ?? "" })
    setShowChallengeForm(true)
  }

  function openEditChallenge(ch: ChallengeAdmin) {
    setEditingChallenge(ch)
    setChallengeForm({
      title: ch.title,
      description: ch.description,
      category: ch.category,
      difficulty: ch.difficulty,
      points: ch.points,
      flag: ch.flag,
      flag_hint: ch.flag_hint ?? "",
      connection_url: ch.connection_url ?? "",
      attachment_url: ch.attachment_url ?? "",
    })
    setShowChallengeForm(true)
  }

  async function saveChallenge(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    setSavingChallenge(true)
    const payload = {
      title: challengeForm.title,
      description: challengeForm.description,
      category: challengeForm.category,
      difficulty: challengeForm.difficulty,
      points: Number(challengeForm.points),
      flag: challengeForm.flag,
      flag_hint: challengeForm.flag_hint || null,
      connection_url: challengeForm.connection_url || null,
      attachment_url: challengeForm.attachment_url || null,
    }
    try {
      if (editingChallenge) {
        await api.put(`/events/${selectedId}/challenges/${editingChallenge.id}`, payload)
        toast.success("Challenge updated")
      } else {
        await api.post(`/events/${selectedId}/challenges`, payload)
        toast.success("Challenge added")
      }
      setShowChallengeForm(false)
      loadChallenges(selectedId)
      refreshEvents()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save challenge")
    } finally {
      setSavingChallenge(false)
    }
  }

  async function deleteChallenge(ch: ChallengeAdmin) {
    if (!selectedId) return
    try {
      await api.delete(`/events/${selectedId}/challenges/${ch.id}`)
      toast.success(`Deleted ${ch.title}`)
      loadChallenges(selectedId)
      refreshEvents()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete challenge")
    }
  }

  /* ---------------- guards ---------------- */

  if (!authLoading && !user) {
    return (
      <AppShell>
        <main className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
          <EmptyState
            title="The host console needs an organiser account."
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

  if (!authLoading && !isOrganiser) {
    return (
      <AppShell>
        <main className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
          <EmptyState
            title="This console is for organisers."
            hint={`Your account role is "${user?.role}". Register a new account with the organiser role to host events.`}
            action={
              <Link
                href="/events"
                className="border border-line px-5 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                back to events
              </Link>
            }
          />
        </main>
      </AppShell>
    )
  }

  /* ---------------- render ---------------- */

  return (
    <AppShell>
      <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Host console
            </h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              {selectedEvent ? selectedEvent.name : "Your events and their challenges."}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedId && (
              <button
                onClick={() => setSelectedId(null)}
                className="border border-line px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                ← all events
              </button>
            )}
            <button
              onClick={openCreateEvent}
              className="border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              + new event
            </button>
          </div>
        </div>

        {eventsLoading ? (
          <LoadingRows rows={4} />
        ) : !selectedId ? (
          myEvents.length === 0 ? (
            <EmptyState
              title="No events yet."
              hint="Create your first event, set its flag format, and load challenges."
              action={
                <button
                  onClick={openCreateEvent}
                  className="border border-primary bg-primary/10 px-5 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
                >
                  create event
                </button>
              }
            />
          ) : (
            <Panel>
              <PanelHeader label={`your events · ${myEvents.length}`} />
              <div>
                {myEvents.map((event) => {
                  const phase = eventPhase(event)
                  return (
                    <div key={event.id} className="trow grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <PhaseDot phase={phase} />
                          <button
                            onClick={() => setSelectedId(event.id)}
                            className="font-display text-[15px] font-semibold text-foreground hover:text-primary"
                          >
                            {event.name}
                          </button>
                          <Chip tone={phase === "live" ? "ok" : phase === "upcoming" ? "info" : "dim"}>
                            {phase}
                          </Chip>
                          {event.flag_format && <Chip tone="amber">{event.flag_format}…</Chip>}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-faint">
                          <span>{event.challenge_count} challenges</span>
                          <span>{event.total_points} pts</span>
                          <span>{event.participant_count} players</span>
                          <span>
                            {formatDateTime(event.start_time)} → {formatDateTime(event.end_time)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:justify-end">
                        <button
                          onClick={() => setSelectedId(event.id)}
                          className="border border-line px-4 py-1.5 text-[13px] text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          manage
                        </button>
                        <button
                          onClick={() => openEditEvent(event)}
                          className="border border-line px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          edit
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Panel>
          )
        ) : (
          <>
            {/* Ops view */}
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="players" value={selectedEvent?.participant_count ?? 0} />
              <Stat label="challenges" value={selectedEvent?.challenge_count ?? 0} />
              <Stat label="points pool" value={(selectedEvent?.total_points ?? 0).toLocaleString()} tone="amber" />
              <Stat
                label="leading"
                value={top3[0] ? top3[0].user_name.split(" ")[0] : "—"}
                tone="ok"
              />
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={openCreateChallenge}
                className="border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                + add challenge
              </button>
              <Link
                href={`/leaderboard?event=${selectedEvent!.id}`}
                className="border border-line px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                live leaderboard →
              </Link>
              <Link
                href={`/events/${selectedEvent!.id}`}
                className="border border-line px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                player view →
              </Link>
              <button
                onClick={() => selectedEvent && openEditEvent(selectedEvent)}
                className="border border-line px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                event settings
              </button>
            </div>

            {top3.length > 0 && (
              <div className="mb-6 grid gap-px border border-line bg-line sm:grid-cols-3">
                {top3.map((entry) => (
                  <div key={entry.user_id} className="bg-panel px-4 py-3">
                    <span className="text-[12px] text-faint">#{entry.rank}</span>
                    <span className="ml-2 text-[13px] text-foreground">{entry.user_name}</span>
                    <span className="float-right text-[13px] text-primary">{entry.score} pts</span>
                  </div>
                ))}
              </div>
            )}

            <Panel>
              <PanelHeader
                label={`challenges · ${challenges.length}`}
                right={
                  <span>
                    flags{" "}
                    {selectedEvent?.flag_format ? (
                      <span className="text-primary">{selectedEvent!.flag_format}…</span>
                    ) : (
                      "any format"
                    )}
                  </span>
                }
              />
              {challengesLoading ? (
                <LoadingRows rows={3} />
              ) : challenges.length === 0 ? (
                <EmptyState
                  title="No challenges yet."
                  hint="Add the first one — title, flag, points. It goes live instantly."
                />
              ) : (
                <div>
                  {challenges.map((ch, i) => (
                    <div key={ch.id} className="trow px-4 py-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="text-[11px] text-faint">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[14px] text-foreground">{ch.title}</span>
                        <Chip>{ch.category}</Chip>
                        <Chip tone={ch.difficulty === "hard" || ch.difficulty === "insane" ? "danger" : "dim"}>
                          {ch.difficulty}
                        </Chip>
                        <span className="text-[12px] text-primary">{ch.points} pts</span>
                        {!ch.is_active && <Chip tone="danger">inactive</Chip>}
                        <span className="ml-auto flex gap-1.5">
                          <button
                            onClick={() => openEditChallenge(ch)}
                            className="border border-line px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                          >
                            edit
                          </button>
                          <button
                            onClick={() => deleteChallenge(ch)}
                            className="border border-line px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:border-danger/50 hover:text-danger"
                          >
                            delete
                          </button>
                        </span>
                      </div>
                      <div className="mt-1 pl-7 text-[12px] text-faint">
                        <span className="text-muted-foreground">{ch.flag}</span>
                        {ch.connection_url && <> · service: {ch.connection_url}</>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </>
        )}
      </main>

      {/* Event dialog */}
      {showEventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={() => setShowEventForm(false)}>
          <div className="panel max-h-[90vh] w-full max-w-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <PanelHeader label={editingEvent ? "event · edit" : "event · create"} />
            <form onSubmit={saveEvent} className="space-y-4 px-5 py-5">
              <Field label="name">
                <input
                  className={inputCls}
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  placeholder="Winter Cup 2026"
                  required
                />
              </Field>
              <Field label="description">
                <textarea
                  className={`${inputCls} min-h-20`}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="What's this event about?"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="starts">
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={eventForm.start_time}
                    onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                    required
                  />
                </Field>
                <Field label="ends">
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={eventForm.end_time}
                    onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                    required
                  />
                </Field>
              </div>
              <Field
                label="flag format"
                hint="Players must submit flags starting with this prefix. Leave empty for free-format."
              >
                <input
                  className={inputCls}
                  value={eventForm.flag_format}
                  onChange={(e) => setEventForm({ ...eventForm, flag_format: e.target.value })}
                  placeholder="T6{"
                />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="border border-line px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="flex items-center gap-2 border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                >
                  {savingEvent && <Spinner />}
                  {editingEvent ? "save changes" : "create event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Challenge dialog */}
      {showChallengeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={() => setShowChallengeForm(false)}>
          <div className="panel max-h-[90vh] w-full max-w-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <PanelHeader label={editingChallenge ? "challenge · edit" : "challenge · new"} />
            <form onSubmit={saveChallenge} className="space-y-4 px-5 py-5">
              <Field label="title">
                <input
                  className={inputCls}
                  value={challengeForm.title}
                  onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                  required
                />
              </Field>
              <Field label="description">
                <textarea
                  className={`${inputCls} min-h-24`}
                  value={challengeForm.description}
                  onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                  required
                />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="category">
                  <select
                    className={inputCls}
                    value={challengeForm.category}
                    onChange={(e) => setChallengeForm({ ...challengeForm, category: e.target.value as ChallengeCategory })}
                  >
                    {["web", "crypto", "reverse", "forensics", "pwn", "osint", "misc"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="difficulty">
                  <select
                    className={inputCls}
                    value={challengeForm.difficulty}
                    onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value as ChallengeDifficulty })}
                  >
                    {["easy", "medium", "hard", "insane"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>
                <Field label="points">
                  <input
                    type="number"
                    min={1}
                    className={inputCls}
                    value={challengeForm.points}
                    onChange={(e) => setChallengeForm({ ...challengeForm, points: Number(e.target.value) })}
                    required
                  />
                </Field>
              </div>
              <Field
                label="flag"
                hint={selectedEvent?.flag_format ? `This event expects flags like ${selectedEvent!.flag_format}…` : undefined}
              >
                <input
                  className={inputCls}
                  value={challengeForm.flag}
                  onChange={(e) => setChallengeForm({ ...challengeForm, flag: e.target.value })}
                  required
                />
              </Field>
              <Field label="hint" hint="Optional. Players reveal it themselves — no point penalty.">
                <input
                  className={inputCls}
                  value={challengeForm.flag_hint}
                  onChange={(e) => setChallengeForm({ ...challengeForm, flag_hint: e.target.value })}
                />
              </Field>
              <Field label="service url" hint="Optional. Dockerised challenge players open in a new tab, e.g. http://localhost:8080.">
                <input
                  className={inputCls}
                  value={challengeForm.connection_url}
                  onChange={(e) => setChallengeForm({ ...challengeForm, connection_url: e.target.value })}
                  placeholder="http://localhost:8080"
                />
              </Field>
              <Field label="attachment url">
                <input
                  className={inputCls}
                  value={challengeForm.attachment_url}
                  onChange={(e) => setChallengeForm({ ...challengeForm, attachment_url: e.target.value })}
                />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChallengeForm(false)}
                  className="border border-line px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={savingChallenge}
                  className="flex items-center gap-2 border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                >
                  {savingChallenge && <Spinner />}
                  {editingChallenge ? "save changes" : "add challenge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
