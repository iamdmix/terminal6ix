"use client"

import { useAuth } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { eventStatus, formatDateTime } from "@/lib/hooks"
import { ApiError, Event, PlatformStats } from "@/lib/types"
import { Calendar, Github, MessageCircle, Swords, Twitter, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const communityStatsFallback = [
  { label: "Active Members", value: "—", icon: Users },
  { label: "Events Hosted", value: "—", icon: Calendar },
  { label: "Challenges", value: "—", icon: Swords },
  { label: "Flags Captured", value: "—", icon: MessageCircle },
]

const platforms = [
  { name: "Discord", icon: MessageCircle, color: "bg-indigo-600" },
  { name: "GitHub", icon: Github, color: "bg-gray-600" },
  { name: "Twitter", icon: Twitter, color: "bg-blue-600" },
]

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setStats(await api.get<PlatformStats>("/stats"))
      } catch {
        setStats(null)
      }
      if (user) {
        try {
          setEvents(await api.get<Event[]>("/events/"))
        } catch (e) {
          toast.error(e instanceof ApiError ? e.message : "Failed to load events")
        }
      }
      setLoading(false)
    }
    if (!authLoading) load()
  }, [authLoading, user])

  async function toggleRegistration(event: Event) {
    if (!user) {
      router.push("/signin")
      return
    }
    setRegistering(event.id)
    try {
      if (event.is_registered) {
        await api.delete(`/events/${event.id}/register`)
        toast.success(`Unregistered from ${event.name}`)
      } else {
        await api.post(`/events/${event.id}/register`)
        toast.success(`Registered for ${event.name}!`)
      }
      setEvents(await api.get<Event[]>("/events/"))
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Action failed")
    } finally {
      setRegistering(null)
    }
  }

  const statValues = stats
    ? [
        { label: "Registered Hackers", value: stats.users.toLocaleString(), icon: Users },
        { label: "Events Hosted", value: stats.events.toLocaleString(), icon: Calendar },
        { label: "Challenges", value: stats.challenges.toLocaleString(), icon: Swords },
        { label: "Flags Captured", value: stats.flags_captured.toLocaleString(), icon: MessageCircle },
      ]
    : communityStatsFallback

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Join Our{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Community
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Live platform stats, real events, and a growing community of hackers.
          </p>
        </div>

        {/* Live platform stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {statValues.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6 text-center">
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Community Platforms */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
          {platforms.map((platform) => (
            <div key={platform.name} className="bg-card border border-border rounded-lg p-8 text-center">
              <div className={`w-16 h-16 ${platform.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                <platform.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">{platform.name}</h3>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                Join {platform.name}
              </Button>
            </div>
          ))}
        </div>

        {/* Events */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              {user ? "All Events" : "Upcoming & Live Events"}
            </h2>
            {!user && !authLoading && (
              <Link href="/signup" className="text-primary hover:underline text-sm">
                Sign up to register
              </Link>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : !user ? (
            <div className="border border-dashed border-border rounded-xl p-12 text-center">
              <p className="text-muted-foreground mb-6">
                Sign in to see live event details, participant counts and register.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => router.push("/signin")} className="bg-gradient-to-r from-primary to-secondary">
                  Sign In
                </Button>
                <Button variant="outline" onClick={() => router.push("/signup")}>
                  Create Account
                </Button>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
              No events yet. Organisers can create the first one from the Host page.
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => {
                const status = eventStatus(event)
                const ended = status.label === "Ended"
                return (
                  <div
                    key={event.id}
                    className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-semibold text-foreground">{event.name}</h3>
                          <Badge variant="outline" className={status.className}>{status.label}</Badge>
                          {event.is_registered && (
                            <Badge variant="outline" className="border-primary/40 text-primary">registered</Badge>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{event.description}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(event.start_time)} → {formatDateTime(event.end_time)}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span>👥 {event.participant_count} registered</span>
                          <span>⚔️ {event.challenge_count} challenges</span>
                          <span>🏆 {event.total_points} points</span>
                        </div>
                      </div>
                      <Button
                        disabled={ended || registering === event.id}
                        variant={event.is_registered ? "outline" : "default"}
                        onClick={() => toggleRegistration(event)}
                        className={event.is_registered ? "" : "bg-gradient-to-r from-primary to-secondary"}
                      >
                        {ended
                          ? "Ended"
                          : registering === event.id
                            ? "..."
                            : event.is_registered
                              ? "Unregister"
                              : "Register"}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
