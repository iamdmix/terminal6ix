"use client"

import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, TrendingUp, TrendingDown } from "lucide-react"

const leaderboardData = [
  {
    rank: 1,
    team: "CyberNinjas",
    score: 2450,
    solved: 23,
    lastSolve: "2 min ago",
    trend: "up",
    country: "🇺🇸",
    members: ["h4ck3r_1", "crypto_master", "web_pwner"],
  },
  {
    rank: 2,
    team: "RootAccess",
    score: 2100,
    solved: 21,
    lastSolve: "15 min ago",
    trend: "up",
    country: "🇩🇪",
    members: ["binary_ninja", "forensic_expert", "sql_injector"],
  },
  {
    rank: 3,
    team: "ByteBandits",
    score: 1890,
    solved: 19,
    lastSolve: "1 hour ago",
    trend: "down",
    country: "🇯🇵",
    members: ["reverse_eng", "crypto_breaker", "web_hacker"],
  },
  {
    rank: 4,
    team: "HackForce",
    score: 1650,
    solved: 18,
    lastSolve: "3 hours ago",
    trend: "up",
    country: "🇬🇧",
    members: ["pwn_master", "stego_hunter", "malware_analyst"],
  },
  {
    rank: 5,
    team: "SecuritySquad",
    score: 1420,
    solved: 16,
    lastSolve: "5 hours ago",
    trend: "stable",
    country: "🇨🇦",
    members: ["buffer_overflow", "hash_cracker", "network_ninja"],
  },
]

const teams = [
  { rank: 1, team: "CyberNinjas", score: 2450, icon: Trophy, color: "text-yellow-500" },
  { rank: 2, team: "RootAccess", score: 2100, icon: Medal, color: "text-gray-400" },
  { rank: 3, team: "ByteBandits", score: 1890, icon: Award, color: "text-amber-600" },
]

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-500" />
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />
    default:
      return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{rank}</span>
  }
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-4 h-4 text-green-500" />
    case "down":
      return <TrendingDown className="w-4 h-4 text-red-500" />
    default:
      return <div className="w-4 h-4 bg-gray-500 rounded-full" />
  }
}

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Live{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time rankings of the world's best cybersecurity teams competing in TerminalSix CTF.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">1,247</div>
            <div className="text-sm text-muted-foreground">Active Teams</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-2">156</div>
            <div className="text-sm text-muted-foreground">Total Challenges</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">23,456</div>
            <div className="text-sm text-muted-foreground">Flags Captured</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-2">72h</div>
            <div className="text-sm text-muted-foreground">Time Remaining</div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-semibold text-foreground">Top Teams</h2>
            <p className="text-muted-foreground">Updated every 30 seconds</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">Rank</th>
                  <th className="text-left p-4 font-semibold text-foreground">Team</th>
                  <th className="text-left p-4 font-semibold text-foreground">Score</th>
                  <th className="text-left p-4 font-semibold text-foreground">Solved</th>
                  <th className="text-left p-4 font-semibold text-foreground">Last Solve</th>
                  <th className="text-left p-4 font-semibold text-foreground">Trend</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((team, index) => (
                  <motion.tr
                    key={team.team}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">{getRankIcon(team.rank)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{team.country}</span>
                        <div>
                          <div className="font-semibold text-foreground">{team.team}</div>
                          <div className="text-sm text-muted-foreground">{team.members.join(", ")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-primary text-lg">{team.score.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{team.solved} challenges</Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">{team.lastSolve}</div>
                    </td>
                    <td className="p-4">{getTrendIcon(team.trend)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Your Team Stats (if logged in) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-6"
        >
          <h3 className="text-xl font-semibold text-foreground mb-4">Your Team Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">#42</div>
              <div className="text-sm text-muted-foreground">Current Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">850</div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Challenges Solved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">+5</div>
              <div className="text-sm text-muted-foreground">Rank Change</div>
            </div>
          </div>
        </motion.div>

        {/* Updated Teams Section */}
        <div className="max-w-2xl mx-auto mt-12">
          {teams.map((team) => (
            <div
              key={team.team}
              className="bg-card border border-border rounded-lg p-6 mb-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <team.icon className={`w-6 h-6 ${team.color}`} />
                <div>
                  <div className="font-semibold text-foreground">{team.team}</div>
                  <div className="text-sm text-muted-foreground">Rank #{team.rank}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">{team.score.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
