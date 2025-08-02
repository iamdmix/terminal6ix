"use client";
import { motion } from "framer-motion";
import { UserPlus, Search, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    icon: UserPlus,
    title: "Sign up & Create Team",
    description:
      "A 30-second onboarding to get you and your team ready for action.",
    step: "01",
  },
  {
    icon: Search,
    title: "Choose Your Event",
    description:
      "Browse active competitions and find one that matches your skill level.",
    step: "02",
  },
  {
    icon: Trophy,
    title: "Climb the Leaderboard",
    description:
      "Solve challenges, submit flags, earn points, and claim victory.",
    step: "03",
  },
];

export function GettingStarted() {
  return (
    <section className="relative w-full px-6 py-20 overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="w-[350px] h-[500px] absolute top-[120px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-28deg] bg-primary/10 blur-[100px] -z-10" />
      <div className="w-[200px] h-[300px] absolute bottom-[80px] right-[18%] origin-center rotate-[35deg] bg-secondary/8 blur-[80px] -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center w-full max-w-3xl gap-6 mx-auto mb-20"
        >
          <h2 className="w-full text-4xl font-extrabold leading-tight tracking-tight text-center break-words text-foreground md:text-5xl md:leading-[54px]">
            Go From Zero to Hacking in 3 Steps
          </h2>
        </motion.div>

        <div className="relative">
          {/* Dashed line connecting the steps */}
          <div
            className="absolute top-1/2 left-0 w-full h-px -translate-y-[4.5rem] hidden lg:block"
            aria-hidden="true"
          >
            <svg width="100%" height="2">
              <path
                d="M0 1 H10000"
                strokeWidth="2"
                stroke="hsl(var(--border))"
                strokeDasharray="8 8"
              />
            </svg>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  ease: "easeOut",
                }}
                className="relative z-10 p-8 text-center bg-background/50 backdrop-blur-sm group rounded-xl border border-border flex flex-col items-center justify-start hover:-translate-y-2 transition-transform duration-300"
              >
                {/* Step Number */}
                <div className="w-16 h-16 mb-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {step.step}
                </div>
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors duration-300">
                  <step.icon className="w-9 h-9 text-primary" />
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground text-md">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <Button size="lg" className="px-10 py-7 text-lg" asChild>
            <Link href="/signup">Start Competing Now</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
