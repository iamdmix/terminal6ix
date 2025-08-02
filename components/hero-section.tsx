"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react"; // Added ArrowRight for a visual cue

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center w-full min-h-screen overflow-hidden bg-background">
      {/* SVG Background - Kept the original as it's a great visual centerpiece */}
      <div className="absolute inset-0 top-[-120px] -z-10 pointer-events-none select-none">
        {/* ... SVG code from your original file remains unchanged ... */}
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 z-30 w-full py-6 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <Shield className="w-7 h-7 text-primary group-hover:animate-pulse" />
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              TerminalSix
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {["Challenges", "Leaderboard", "Community"].map((name) => (
              <Link
                key={name}
                href={`/${name.toLowerCase()}`}
                className="text-md text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                {name}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild className="group">
              <Link href="/signup">
                Get Started <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-7xl mx-auto gap-8 text-center pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="flex flex-col items-center justify-center gap-6"
        >
          <h1 className="w-full text-5xl font-extrabold leading-tight text-center text-foreground md:text-7xl md:leading-[1.1]">
            Got a CTF Event?
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              We built the platform.
            </span>
          </h1>
          <p className="max-w-3xl text-lg font-medium leading-tight text-center text-muted-foreground md:text-xl">
            A free & open-source platform, purpose-built by hackers to host world-class cybersecurity competitions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
          className="flex flex-col items-center justify-center gap-4 mt-6 sm:flex-row"
        >
          <Button
            size="lg"
            className="px-8 py-6 text-md font-semibold transition-all rounded-lg shadow-lg hover:shadow-primary/20 hover:scale-105"
            asChild
          >
            <Link href="/host">Host an Event</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-md font-semibold transition-all bg-background/50 border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:scale-105 rounded-lg"
            asChild
          >
            <Link
              href="https://github.com/TerminalSix/TerminalSix"
              target="_blank"
            >
              View on GitHub
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
