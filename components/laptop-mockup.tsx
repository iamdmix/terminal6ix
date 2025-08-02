"use client"

import { motion } from "framer-motion"
import { Shield } from "lucide-react" // Fixed import

export function LaptopMockup() {
  return (
    <div className="relative max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        animate={{
          rotateX: [0, 1, 0],
          rotateY: [0, -1, 0],
        }}
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
        className="relative"
      >
        {/* MacBook Frame */}
        <div className="relative bg-gray-800 rounded-2xl p-3 shadow-2xl">
          <div className="bg-black rounded-xl overflow-hidden aspect-[16/10] relative">
            {/* Screen Content */}
            <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 relative overflow-hidden">
              {/* Matrix Rain Effect */}
              <div className="absolute inset-0 opacity-30">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-primary text-xs font-mono"
                    style={{
                      left: `${(i * 7) % 100}%`,
                      top: "-10%",
                    }}
                    animate={{
                      y: ["0vh", "110vh"],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 3,
                      ease: "linear",
                    }}
                  >
                    {Array.from({ length: 8 }).map((_, j) => (
                      <div key={j} className="mb-1">
                        {String.fromCharCode(0x30a0 + Math.random() * 96)}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>

              {/* Dashboard UI */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" />
                    <span className="text-white font-bold text-lg">TerminalSix</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {/* Leaderboard */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                    <div className="text-primary font-semibold mb-3 flex items-center gap-2">🏆 Live Leaderboard</div>
                    <div className="space-y-2">
                      {[
                        { team: "CyberNinjas", score: 2450, trend: "up" },
                        { team: "RootAccess", score: 2100, trend: "up" },
                        { team: "ByteBandits", score: 1890, trend: "down" },
                        { team: "HackForce", score: 1650, trend: "up" },
                      ].map((entry, i) => (
                        <motion.div
                          key={entry.team}
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-secondary font-mono text-xs">#{i + 1}</span>
                            <span className="text-gray-300 text-xs">{entry.team}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-primary font-mono text-xs">{entry.score}</span>
                            <span className={`text-xs ${entry.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                              {entry.trend === "up" ? "↗" : "↘"}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Active Challenges */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-secondary/20">
                    <div className="text-secondary font-semibold mb-3 flex items-center gap-2">
                      🎯 Active Challenges
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: "Web Exploitation", difficulty: "Medium", solved: 23 },
                        { name: "Cryptography", difficulty: "Hard", solved: 8 },
                        { name: "Forensics", difficulty: "Easy", solved: 45 },
                        { name: "Reverse Engineering", difficulty: "Hard", solved: 12 },
                      ].map((challenge, i) => (
                        <motion.div
                          key={challenge.name}
                          initial={{ y: 10, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="border-l-2 border-secondary/50 pl-3"
                        >
                          <div className="text-gray-300 text-xs font-medium">{challenge.name}</div>
                          <div className="flex justify-between items-center mt-1">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                challenge.difficulty === "Easy"
                                  ? "bg-green-500/20 text-green-400"
                                  : challenge.difficulty === "Medium"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {challenge.difficulty}
                            </span>
                            <span className="text-xs text-gray-400">{challenge.solved} solved</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                    <div className="text-primary font-semibold mb-3 flex items-center gap-2">⚡ System Status</div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-xs">Active Users</span>
                        <span className="text-primary font-mono text-xs">1,247</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-xs">Containers</span>
                        <span className="text-secondary font-mono text-xs">89 running</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-xs">Uptime</span>
                        <span className="text-green-400 font-mono text-xs">99.9%</span>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-gray-400 mb-1">Server Load</div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: "65%" }}
                            transition={{ duration: 2, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terminal Footer */}
                <div className="mt-4 bg-black/50 rounded p-2 font-mono text-xs">
                  <div className="text-primary">$ tail -f /var/log/ctf.log</div>
                  <div className="text-gray-400">[2024-01-15 14:32:15] Flag submitted by team CyberNinjas</div>
                  <div className="text-gray-400">[2024-01-15 14:32:18] New challenge "Buffer Overflow" deployed</div>
                  <div className="text-secondary animate-pulse">█</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MacBook Base */}
        <div className="w-full h-6 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-2xl mt-1 relative">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gray-600"></div>
        </div>
      </motion.div>
    </div>
  )
}
