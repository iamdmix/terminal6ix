"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative flex flex-col items-center justify-center w-full px-6 py-20 overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 opacity-50">
        {/* Animated Aurora Background */}
        <motion.div
          animate={{ x: [-100, 100, -100], y: [-50, 50, -50] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
          className="w-[500px] h-[700px] absolute top-[40%] left-[30%] -translate-x-1/2 -translate-y-1/2 origin-center rotate-[-33deg] bg-primary/15 blur-[150px]"
        />
        <motion.div
          animate={{ x: [100, -100, 100], y: [50, -50, 50] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
          className="w-[400px] h-[500px] absolute top-[60%] left-[70%] -translate-x-1/2 -translate-y-1/2 origin-center rotate-[40deg] bg-secondary/15 blur-[150px]"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full p-10 text-center bg-card/50 backdrop-blur-xl md:p-16 rounded-2xl shadow-2xl outline outline-1 outline-border"
        >
          <div className="flex flex-col items-center justify-center gap-6">
            <h2 className="w-full text-4xl font-extrabold leading-tight text-center text-foreground md:text-5xl md:leading-[54px]">
              Ready to Host Your Next CTF?
            </h2>
            <p className="max-w-2xl text-lg font-medium leading-tight text-center text-muted-foreground md:text-xl">
              Launch secure, scalable cybersecurity competitions for your
              university, community, or company. Free, open source, and ready
              for your next event.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 mt-6 sm:flex-row">
              <Button
                size="lg"
                className="px-8 py-6 text-md font-semibold"
                asChild
              >
                <Link href="/docs">Get Started Now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-md font-semibold bg-background/50"
                asChild
              >
                <Link
                  href="https://github.com/TerminalSix/TerminalSix"
                  target="_blank"
                >
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
