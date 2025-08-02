"use client";

import { motion } from "framer-motion";
import { Shield, Users, Flag, Terminal, Lock, Zap } from "lucide-react";

// This is a sub-component for the bento grid.
type CyberCardProps = {
  title: string;
  description: string;
  Component: React.ComponentType;
  icon: React.ComponentType<{ className?: string }>;
};

function CyberCard({
  title,
  description,
  Component,
  icon: Icon,
}: CyberCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        },
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative flex flex-col items-start justify-start w-full overflow-hidden rounded-[10px] bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out hover:shadow-[0px_8px_16px_rgba(0,0,0,0.2)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[10px] opacity-0 group-hover:opacity-100 transition-all duration-500" />
      <div className="self-stretch p-6 flex flex-col justify-start items-start gap-2 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center shadow-[0px_2px_4px_rgba(0,0,0,0.16)] group-hover:shadow-[0px_4px_8px_rgba(0,0,0,0.24)] group-hover:scale-110 transition-all duration-300">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <p className="self-stretch text-foreground text-lg font-semibold leading-7 group-hover:text-primary transition-colors duration-300">
              {title}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="self-stretch h-72 relative -mt-0.5 z-10">
        <Component />
      </div>
    </motion.div>
  );
}

export function CybersecurityBento() {
  const cards = [
    {
      title: "AI-Powered Threat Detection",
      description:
        "Advanced algorithms identify and prevent cheating in real-time.",
      Component: () => (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="bg-background/50 rounded-lg p-4 border border-primary/20 w-full max-w-sm shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Threat Level
                </span>
                <span className="text-sm text-primary font-mono">SECURE</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: "85%" }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                  viewport={{ once: true }}
                />
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Scanning... 1,247 participants monitored
              </div>
            </div>
          </div>
        </div>
      ),
      icon: Shield,
    },
    {
      title: "Dynamic Flag Generation",
      description:
        "Unique flags per team eliminate sharing and ensure fair play.",
      Component: () => (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="bg-background/50 rounded-lg p-4 border border-secondary/20 w-full max-w-sm font-mono shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
            <div className="space-y-2 text-sm">
              <div className="text-secondary">$ generate_flag --team=alpha</div>
              <div className="text-muted-foreground">
                {">"} Generating unique flag...
              </div>
              <div className="text-primary">FLAG{`{a7b9c2d4e6f8}`}</div>
              <div className="text-muted-foreground">
                ✓ Flag deployed to team sandbox
              </div>
            </div>
          </div>
        </div>
      ),
      icon: Flag,
    },
    {
      title: "Isolated Docker Environments",
      description: "Each team gets their own secure sandbox for challenges.",
      Component: () => (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
            {["Team Alpha", "Team Beta", "Team Gamma", "Team Delta"].map(
              (team, i) => (
                <motion.div
                  key={team}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="bg-background/50 rounded border border-primary/20 p-3 text-center shadow-[0px_2px_4px_rgba(0,0,0,0.08)]"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded mx-auto mb-2 flex items-center justify-center">
                    <Terminal className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs text-muted-foreground">{team}</div>
                  <div className="text-xs text-primary font-mono">ISOLATED</div>
                </motion.div>
              )
            )}
          </div>
        </div>
      ),
      icon: Lock,
    },
    {
      title: "Real-Time Leaderboards",
      description: "Live scoring and rankings keep the competition intense.",
      Component: () => (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="bg-background/50 rounded-lg p-4 border border-primary/20 w-full max-w-sm shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-foreground mb-3">
                Live Rankings
              </div>
              {[
                { team: "CyberNinjas", score: 2450, trend: "up" },
                { team: "RootAccess", score: 2100, trend: "up" },
                { team: "ByteBandits", score: 1890, trend: "down" },
              ].map((entry, i) => (
                <motion.div
                  key={entry.team}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-mono">#{i + 1}</span>
                    <span className="text-sm text-foreground">
                      {entry.team}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary font-mono">
                      {entry.score}
                    </span>
                    <span
                      className={`text-xs ${
                        entry.trend === "up" ? "text-primary" : "text-red-400"
                      }`}
                    >
                      {entry.trend === "up" ? "▲" : "▼"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ),
      icon: Users,
    },
    {
      title: "Multi-Category Challenges",
      description: "Web, crypto, forensics, reverse engineering, and more.",
      Component: () => (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {[
              { name: "Web", icon: "🌐", difficulty: "Medium" },
              { name: "Crypto", icon: "🔐", difficulty: "Hard" },
              { name: "Forensics", icon: "🔍", difficulty: "Easy" },
              { name: "Reverse", icon: "⚙️", difficulty: "Hard" },
            ].map((category, i) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, rotateY: -90 }}
                whileInView={{ opacity: 1, rotateY: 0 }}
                transition={{ delay: i * 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
                className="bg-background/50 rounded border border-secondary/20 p-3 text-center hover:border-secondary/40 transition-colors shadow-[0px_2px_4px_rgba(0,0,0,0.08)]"
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm text-foreground font-semibold">
                  {category.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {category.difficulty}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ),
      icon: Terminal,
    },
    {
      title: "Lightning-Fast Deployment",
      description: "From setup to live CTF in minutes, not hours.",
      Component: () => (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="bg-background/50 rounded-lg p-4 border border-primary/20 w-full max-w-sm shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Deployment Status
                </span>
                <span className="text-sm text-primary font-mono">LIVE</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="text-primary">✓ Infrastructure provisioned</div>
                <div className="text-primary">✓ Challenges deployed</div>
                <div className="text-primary">✓ Teams configured</div>
              </div>
              <div className="text-center pt-2">
                <motion.div
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary rounded-full px-3 py-1 shadow-[0px_2px_4px_rgba(0,0,0,0.16)]"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Zap className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-semibold">
                    Deployment time: 2m 34s
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      ),
      icon: Zap,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <section className="relative flex flex-col items-center justify-center w-full px-6 py-20 bg-background">
      {/* Background Gradients */}
      <div className="w-[400px] h-[600px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33deg] bg-primary/12 blur-[120px] -z-10" />
      <div className="w-[250px] h-[350px] absolute bottom-[100px] right-[15%] origin-center rotate-[40deg] bg-secondary/10 blur-[90px] -z-10" />

      <div className="relative z-10 flex flex-col items-start justify-start max-w-7xl mx-auto gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center w-full gap-4 py-8 md:py-14"
        >
          <div className="flex flex-col items-center justify-center w-full max-w-3xl gap-6">
            <h2 className="w-full text-4xl font-extrabold leading-tight text-center break-words text-foreground md:text-5xl md:leading-[54px]">
              An Enterprise-Grade Security Engine
            </h2>
            <p className="max-w-[600px] text-center text-lg font-medium leading-tight text-muted-foreground break-words md:text-xl">
              Secure, scalable, and sophisticated. We provide the core
              infrastructure for world-class cybersecurity competitions.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {cards.map((card) => (
            <CyberCard key={card.title} {...card} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
