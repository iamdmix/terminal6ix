"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const features = [
  {
    title: "Eliminate Cheating",
    description:
      "Dynamic flags generate unique identifiers for each team, ensuring a fair and competitive event.",
  },
  {
    title: "Guarantee Stability",
    description:
      "Docker-based isolation prevents challenge interference and provides a secure sandbox for every participant.",
  },
  {
    title: "Innovate Freely",
    description:
      "Our open-source platform is driven by community contributions, offering transparency and endless extensibility.",
  },
  {
    title: "Deploy with Ease",
    description:
      "Built with Quarkus & Docker for a developer-friendly experience and seamless integrations.",
  },
];

export function WhyTerminalSix() {
  return (
    <section className="relative flex flex-col items-center justify-center w-full px-6 py-20 bg-background">
      {/* Background Gradients */}
      <div className="w-[350px] h-[500px] absolute top-[120px] left-1/4 origin-top-left rotate-[-20deg] bg-primary/10 blur-[100px] -z-10" />
      <div className="w-[200px] h-[300px] absolute bottom-[100px] right-[20%] origin-center rotate-[40deg] bg-secondary/8 blur-[80px] -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl md:leading-[54px]">
              Engineered for Fair, Secure & Scalable CTFs
            </h2>
            <p className="mb-10 text-xl font-medium leading-tight text-muted-foreground md:text-2xl">
              From local hackathons to global competitions, TerminalSix delivers
              a robust, extensible platform built for performance and integrity.
            </p>

            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    ease: "easeOut",
                  }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative p-8 bg-[rgba(231,236,235,0.08)] rounded-xl shadow-2xl outline outline-1 outline-border"
          >
            <div className="p-5 font-mono text-sm bg-black/80 rounded-lg shadow-inner border border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-red-400">●</span>
                <span className="text-yellow-400">●</span>
                <span className="text-green-400">●</span>
              </div>
              <div className="mt-4">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "linear" }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  <span className="text-green-400">$</span> docker run -d
                  terminalsix/challenge
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 }}
                  className="text-muted-foreground"
                >
                  &gt; Starting isolated environment...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.6 }}
                  className="text-primary"
                >
                  ✓ Container ready [team_alpha]
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2.0 }}
                  className="text-secondary"
                >
                  ✓ Dynamic flag generated: FLAG{`{...}`}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
