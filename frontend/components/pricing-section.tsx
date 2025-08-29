"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

const pricingPlan = {
  name: "Community Edition",
  price: "$0",
  description:
    "Host your own CTFs with no hidden paywalls. Free and open source, forever.",
  features: [
    "Unlimited events & participants",
    "Real-time leaderboards",
    "Isolated Docker sandboxes",
    "Dynamic flags per team",
    "Instant flag validation",
    "Community-driven & open source",
    "Developer-friendly integrations",
    "No vendor lock-in",
  ],
  buttonText: "Get Deployment Guide",
};

export function PricingSection() {
  return (
    <section className="relative flex flex-col items-center justify-center w-full px-6 py-20 bg-background">
      {/* Background Gradients */}
      <div className="w-[350px] h-[500px] absolute top-[120px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-30deg] bg-primary/10 blur-[110px] -z-10" />
      <div className="w-[200px] h-[300px] absolute bottom-[100px] right-[20%] origin-center rotate-[40deg] bg-secondary/8 blur-[85px] -z-10" />

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center w-full max-w-3xl gap-6 mx-auto mb-12"
        >
          <h2 className="w-full text-4xl font-extrabold leading-tight text-center break-words text-foreground md:text-5xl md:leading-[54px]">
            Free. Open. Powerful.
          </h2>
          <p className="text-center text-lg font-medium leading-tight text-muted-foreground break-words">
            We believe world-class security tools should be accessible to
            everyone.
            <br />
            Need enterprise support?{" "}
            <Link
              href="/contact"
              className="text-primary underline hover:text-secondary"
            >
              Contact us for custom options.
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col items-center justify-center"
        >
          <div className="group relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[rgba(231,236,235,0.08)] p-10 shadow-2xl outline outline-1 outline-border transition-all duration-500 hover:shadow-primary/20 hover:-translate-y-2">
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="text-3xl font-bold text-foreground">
                {pricingPlan.name}
              </div>
              <div className="text-7xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-105">
                {pricingPlan.price}
              </div>
              <div className="text-lg text-muted-foreground">
                {pricingPlan.description}
              </div>
              <Button size="lg" className="px-8 py-6 text-lg" asChild>
                <Link href="/docs">{pricingPlan.buttonText}</Link>
              </Button>
            </div>

            <div className="w-full h-px my-10 bg-border" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {pricingPlan.features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full bg-primary/20">
                    <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                  </div>
                  <span className="font-medium text-foreground text-md">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
