"use client"

import { useAuth } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { eventStatus, formatDateTime } from "@/lib/hooks"
import { ApiError, ChallengeAdmin, ChallengeCategory, ChallengeDifficulty, Event } from "@/lib/types"
import { CalendarPlus, Lock, Pencil, Plus, Shield, Trash2, Trophy } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

const emptyChallengeForm = {
  title: "",
  description: "",
  category: "misc" as ChallengeCategory,
  difficulty: "easy" as ChallengeDifficulty,
  points: 100,
  flag: "",
  flag_hint: "",
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default function HostPage() {
  const { user, loading: authLoading } = useAuth()
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  // Event creation form
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventName, setEventName] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventStart, setEventStart] = useState("")
  const [eventEnd, setEventEnd] = useState("")
  const [creating, setCreating] = useState(false)

  // Challenge management
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [challenges, setChallenges] = useState<ChallengeAdmin[]>([])
  const [challengesLoading, setChallengesLoading] = useState(false)
  const [challengeForm, setChallengeForm] = useState(emptyChallengeForm)
  const [editingChallenge, setEditingChallenge] = useState<ChallengeAdmin | null>(null)
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [savingChallenge, setSavingChallenge] = useState(false)

  const isOrganiser = user?.role === "organiser"

  const loadEvents = useCallback(async () => {
    if (!user) return
    try {
      const all = await api.get<Event[]>("/events/")
      setMyEvents(all.filter((e) => e.created_by === user.id))
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to load your events")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading) loadEvents()
  }, [authLoading, loadEvents])

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
    if (selectedEvent) loadChallenges(selectedEvent.id)
  }, [selectedEvent, loadChallenges])

  async function createEvent(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const created = await api.post<Event>("/events/", {
        name: eventName,
        description: eventDescription || null,
        start_time: new Date(eventStart).toISOString(),
        end_time: new Date(eventEnd).toISOString(),
      })
      toast.success(`Event "${created.name}" created!`)
      setShowEventForm(false)
      setEventName("")
      setEventDescription("")
      setEventStart("")
      setEventEnd("")
      await loadEvents()
      setSelectedEvent(created)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to create event")
    } finally {
      setCreating(false)
    }
  }

  async function saveChallenge(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEvent) return
    setSavingChallenge(true)
    const payload = {
      title: challengeForm.title,
      description: challengeForm.description,
      category: challengeForm.category,
      difficulty: challengeForm.difficulty,
      points: Number(challengeForm.points),
      flag: challengeForm.flag,
      flag_hint: challengeForm.flag_hint || null,
    }
    try {
      if (editingChallenge) {
        await api.put(`/events/${selectedEvent.id}/challenges/${editingChallenge.id}`, payload)
        toast.success("Challenge updated")
      } else {
        await api.post(`/events/${selectedEvent.id}/challenges`, payload)
        toast.success("Challenge created")
      }
      setShowChallengeForm(false)
      setEditingChallenge(null)
      setChallengeForm(emptyChallengeForm)
      loadChallenges(selectedEvent.id)
      loadEvents()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to save challenge")
    } finally {
      setSavingChallenge(false)
    }
  }

  async function deleteChallenge(challenge: ChallengeAdmin) {
    if (!selectedEvent) return
    try {
      await api.delete(`/events/${selectedEvent.id}/challenges/${challenge.id}`)
      toast.success(`Deleted "${challenge.title}"`)
      loadChallenges(selectedEvent.id)
      loadEvents()
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to delete challenge")
    }
  }

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-md mx-auto px-6 py-32 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Sign in to host</h1>
          <p className="text-muted-foreground mb-8">You need an organiser account to host CTF events.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => (window.location.href = "/signin")}>Sign In</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/signup")}>
              Create Account
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!authLoading && user && !isOrganiser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-md mx-auto px-6 py-32 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Organiser account required</h1>
          <p className="text-muted-foreground mb-8">
            Your account is a <span className="text-primary">{user.role}</span> account. Sign up with a
            new account and choose the <span className="text-primary">organiser</span> role to host events.
          </p>
          <Button asChild variant="outline">
            <Link href="/challenges">Back to challenges</Link>
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Host a CTF</h1>
            <p className="text-muted-foreground mt-2">Create events, add challenges, share flags.</p>
          </div>
          <Button
            onClick={() => setShowEventForm(true)}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            <CalendarPlus className="w-4 h-4 mr-2" /> New Event
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        ) : myEvents.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-16 text-center">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-6">You haven&apos;t created any events yet.</p>
            <Button onClick={() => setShowEventForm(true)} className="bg-gradient-to-r from-primary to-secondary">
              Create your first event
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Event list */}
            <div className="space-y-4">
              {myEvents.map((event) => {
                const status = eventStatus(event)
                const active = selectedEvent?.id === event.id
                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full text-left rounded-xl border p-5 transition-all ${
                      active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className={status.className}>{status.label}</Badge>
                      <div className="text-sm text-muted-foreground">
                        {event.challenge_count} challenges • {event.total_points} pts • {event.participant_count} players
                      </div>
                    </div>
                    <div className="font-semibold text-foreground">{event.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(event.start_time)} → {formatDateTime(event.end_time)}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Challenge manager for selected event */}
            <div>
              {selectedEvent ? (
                <div className="rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{selectedEvent.name}</h2>
                      <p className="text-sm text-muted-foreground">Challenge manager</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingChallenge(null)
                        setChallengeForm(emptyChallengeForm)
                        setShowChallengeForm(true)
                      }}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>

                  {challengesLoading ? (
                    <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
                  ) : challenges.length === 0 ? (
                    <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
                      No challenges yet. Add the first one.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {challenges.map((challenge) => (
                        <div key={challenge.id} className="flex items-center justify-between border border-border rounded-lg p-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate">{challenge.title}</span>
                              {!challenge.is_active && <Badge variant="outline" className="text-muted-foreground">inactive</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 capitalize">
                              {challenge.category} • {challenge.difficulty} • {challenge.points} pts
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingChallenge(challenge)
                                setChallengeForm({
                                  title: challenge.title,
                                  description: challenge.description,
                                  category: challenge.category,
                                  difficulty: challenge.difficulty,
                                  points: challenge.points,
                                  flag: challenge.flag,
                                  flag_hint: challenge.flag_hint || "",
                                })
                                setShowChallengeForm(true)
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteChallenge(challenge)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-border text-sm">
                    <Link
                      href="/leaderboard"
                      className="text-primary hover:underline"
                    >
                      View live leaderboard →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">
                  Select one of your events to manage its challenges.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* New event dialog */}
      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a new CTF event</DialogTitle>
          </DialogHeader>
          <form onSubmit={createEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ev-name">Name</Label>
              <Input id="ev-name" value={eventName} onChange={(e) => setEventName(e.target.value)} required placeholder="Winter CTF 2026" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-desc">Description</Label>
              <Textarea id="ev-desc" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="What's this event about?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ev-start">Starts</Label>
                <Input id="ev-start" type="datetime-local" value={eventStart} onChange={(e) => setEventStart(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-end">Ends</Label>
                <Input id="ev-end" type="datetime-local" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEventForm(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="bg-gradient-to-r from-primary to-secondary">
                {creating ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Challenge form dialog */}
      <Dialog open={showChallengeForm} onOpenChange={(open) => { if (!open) { setShowChallengeForm(false); setEditingChallenge(null) } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingChallenge ? "Edit challenge" : "New challenge"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveChallenge} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ch-title">Title</Label>
              <Input id="ch-title" value={challengeForm.title} onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-desc">Description</Label>
              <Textarea id="ch-desc" value={challengeForm.description} onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })} required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={challengeForm.category}
                  onChange={(e) => setChallengeForm({ ...challengeForm, category: e.target.value as ChallengeCategory })}
                >
                  {["web", "crypto", "reverse", "forensics", "pwn", "osint", "misc"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={challengeForm.difficulty}
                  onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value as ChallengeDifficulty })}
                >
                  {["easy", "medium", "hard", "insane"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input type="number" min={1} value={challengeForm.points} onChange={(e) => setChallengeForm({ ...challengeForm, points: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-flag">Flag</Label>
              <Input id="ch-flag" value={challengeForm.flag} onChange={(e) => setChallengeForm({ ...challengeForm, flag: e.target.value })} required placeholder="flag{...}" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-hint">Hint (optional)</Label>
              <Input id="ch-hint" value={challengeForm.flag_hint} onChange={(e) => setChallengeForm({ ...challengeForm, flag_hint: e.target.value })} placeholder="Shown when players reveal a hint" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowChallengeForm(false)}>Cancel</Button>
              <Button type="submit" disabled={savingChallenge} className="bg-gradient-to-r from-primary to-secondary">
                {savingChallenge ? "Saving..." : editingChallenge ? "Save changes" : "Create challenge"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
