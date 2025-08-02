"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Users, Github, Twitter, Calendar } from "lucide-react"

const communityStats = [
  { label: "Active Members", value: "15,247", icon: Users },
  { label: "Discord Messages", value: "2.3M", icon: MessageCircle },
  { label: "GitHub Stars", value: "8.9K", icon: Github },
  { label: "Events Hosted", value: "156", icon: Calendar },
]

const featuredMembers = [
  {
    name: "Alex Chen",
    role: "CTF Champion",
    avatar: "🥇",
    contributions: "Created 23 challenges",
    speciality: "Web Security",
  },
  {
    name: "Sarah Kim",
    role: "Community Moderator",
    avatar: "🛡️",
    contributions: "Helped 500+ members",
    speciality: "Cryptography",
  },
  {
    name: "Marcus Johnson",
    role: "Challenge Creator",
    avatar: "🔧",
    contributions: "15 expert challenges",
    speciality: "Binary Exploitation",
  },
  {
    name: "Elena Rodriguez",
    role: "Event Organizer",
    avatar: "🎯",
    contributions: "Organized 12 CTFs",
    speciality: "Forensics",
  },
]

const upcomingEvents = [
  {
    title: "CyberStorm 2024",
    date: "March 15-17, 2024",
    type: "Competition",
    participants: "500+",
    prize: "$10,000",
  },
  {
    title: "Beginner's Workshop",
    date: "March 22, 2024",
    type: "Workshop",
    participants: "100",
    prize: "Free",
  },
  {
    title: "Advanced Crypto Challenge",
    date: "April 5, 2024",
    type: "Special Event",
    participants: "50",
    prize: "$2,000",
  },
]

const platforms = [
  { name: "Discord", icon: MessageCircle, color: "bg-indigo-600" },
  { name: "GitHub", icon: Github, color: "bg-gray-600" },
  { name: "Twitter", icon: Twitter, color: "bg-blue-600" },
]

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Join Our{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Community</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with cybersecurity enthusiasts, share knowledge, and grow together in the world's most active CTF
            community.
          </p>
        </motion.div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {communityStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-lg p-6 text-center"
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Community Platforms */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          {platforms.map((platform) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-lg p-8 text-center"
            >
              <div className={`w-16 h-16 ${platform.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                <platform.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">{platform.name}</h3>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                Join {platform.name}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Featured Community Members */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">Featured Community Members</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
              >
                <div className="text-4xl mb-4">{member.avatar}</div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                <Badge variant="outline" className="mb-3">
                  {member.role}
                </Badge>
                <p className="text-sm text-muted-foreground mb-2">{member.contributions}</p>
                <p className="text-xs text-primary">{member.speciality}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">Upcoming Events</h2>
          <div className="space-y-6">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{event.title}</h3>
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">{event.date}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>👥 {event.participants} participants</span>
                      <span>💰 {event.prize} prize pool</span>
                    </div>
                  </div>
                  <Button className="mt-4 md:mt-0 bg-gradient-to-r from-primary to-secondary">Register Now</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
