"use client"

import { motion } from "framer-motion"

export function MacbookMockup() {
  return (
    <div className="relative">
      <motion.div
        animate={{
          rotateX: [0, 2, 0],
          rotateY: [0, -2, 0],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="relative"
      >
        {/* MacBook Frame */}
        <div className="relative bg-gray-800 rounded-lg p-2 shadow-2xl">
          <div className="bg-black rounded-md overflow-hidden aspect-[16/10]">
            {/* Screen Content */}
            <div className="h-full bg-gradient-to-br from-gray-900 to-black p-4 relative overflow-hidden">
              {/* Matrix Rain Effect */}
              <div className="absolute inset-0">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-green-400 text-xs font-mono opacity-60"
                    style={{
                      left: `${(i * 5) % 100}%`,
                      top: "-10%",
                    }}
                    animate={{
                      y: ["0vh", "110vh"],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                      ease: "linear",
                    }}
                  >
                    {Array.from({ length: 10 }).map((_, j) => (
                      <div key={j} className="mb-1">
                        {String.fromCharCode(0x30a0 + Math.random() * 96)}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>

              {/* Dashboard UI */}
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-purple-400 font-bold">TerminalSix</div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-cyan-400 mb-1">Leaderboard</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-gray-300">
                        <span>Team Alpha</span>
                        <span className="text-green-400">2450</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Cyber Ninjas</span>
                        <span className="text-green-400">2100</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Root Access</span>
                        <span className="text-green-400">1890</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-cyan-400 mb-1">Active Challenges</div>
                    <div className="space-y-1">
                      <div className="text-gray-300">🔒 Web Exploitation</div>
                      <div className="text-gray-300">🛡️ Cryptography</div>
                      <div className="text-gray-300">🔍 Forensics</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MacBook Base */}
        <div className="w-full h-4 bg-gray-700 rounded-b-lg mt-1"></div>
      </motion.div>
    </div>
  )
}
