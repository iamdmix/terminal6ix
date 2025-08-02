"use client"

import { motion } from "framer-motion"
import { Shield } from "lucide-react"

export function LaptopMockup() {
  return (
    <div className="relative max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {/* MacBook Frame */}
        <div className="relative bg-gray-800 rounded-2xl p-3 shadow-2xl">
          <div className="bg-black rounded-xl overflow-hidden aspect-[16/10] relative">
            {/* Screen Content */}
            <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 relative overflow-hidden">
              {/* Simplified Matrix Effect */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-primary text-xs font-mono"
                    style={{
                      left: `${(i * 12) % 100}%`,
                      top: "-5%",
                    }}
                    animate={{
                      y: ["0vh", "105vh"],
                    }}
                    transition={{
                      duration: 5 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                      ease: "linear",
                    }}
                  >
                    {Array.from({ length: 6 }).map((_, j) => (
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

                {/* Main Content Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {/* Leaderboard */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                    <div className="text-primary font-semibold mb-3">🏆 Live Leaderboard</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-secondary font-mono text-xs">#1</span>
                          <span className="text-gray-300 text-xs">CyberNinjas</span>
                        </div>
                        <span className="text-primary font-mono text-xs">2450</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-secondary font-mono text-xs">#2</span>
                          <span className="text-gray-300 text-xs">RootAccess</span>
                        </div>
                        <span className="text-primary font-mono text-xs">2100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-secondary font-mono text-xs">#3</span>
                          <span className="text-gray-300 text-xs">ByteBandits</span>
                        </div>
                        <span className="text-primary font-mono text-xs">1890</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Challenges */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-secondary/20">
                    <div className="text-secondary font-semibold mb-3">🎯 Active Challenges</div>
                    <div className="space-y-2">
                      <div className="text-gray-300 text-xs">🌐 Web Exploitation</div>
                      <div className="text-gray-300 text-xs">🔐 Cryptography</div>
                      <div className="text-gray-300 text-xs">🔍 Forensics</div>
                      <div className="text-gray-300 text-xs">⚙️ Reverse Engineering</div>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                    <div className="text-primary font-semibold mb-3">⚡ System Status</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-xs">Active Users</span>
                        <span className="text-primary font-mono text-xs">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-xs">Containers</span>
                        <span className="text-secondary font-mono text-xs">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-xs">Uptime</span>
                        <span className="text-green-400 font-mono text-xs">99.9%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terminal Footer */}
                <div className="mt-4 bg-black/50 rounded p-2 font-mono text-xs">
                  <div className="text-primary">$ tail -f /var/log/ctf.log</div>
                  <div className="text-gray-400">[14:32:15] Flag submitted by CyberNinjas</div>
                  <div className="text-secondary animate-pulse">█</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MacBook Base */}
        <div className="w-full h-6 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-2xl mt-1"></div>
      </motion.div>
    </div>
  )
}
