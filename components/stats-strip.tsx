"use client";
import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";
import { Users, Activity, Trophy, Flag } from "lucide-react";
import { motion, easeOut } from "framer-motion";

const stats = [
  { icon: Users, value: 5000, label: "Users", suffix: "+" },
  { icon: Activity, value: 2147, label: "Active", suffix: "+" },
  { icon: Trophy, value: 62, label: "CTFs Hosted", suffix: "+" },
  { icon: Flag, value: 18230, label: "Flags Captured", suffix: "+" },
];

export function StatsStrip() {
  const [counts, setCounts] = useState(stats.map(() => 0));
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1500; // ms
    const steps = 60;
    const interval = duration / steps;

    const counters = stats.map((stat, i) => {
      const increment = stat.value / steps;
      let currentCount = 0;
      const timer = setInterval(() => {
        currentCount += increment;
        if (currentCount >= stat.value) {
          clearInterval(timer);
          currentCount = stat.value;
        }
        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[i] = Math.ceil(currentCount);
          return newCounts;
        });
      }, interval);
      return timer;
    });

    return () => counters.forEach((timer) => clearInterval(timer));
  }, [inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
  };

  return (
    <section ref={ref} className="w-full py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              className="group w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out hover:shadow-[0px_8px_16px_rgba(0,0,0,0.2)] hover:scale-[1.02] hover:-translate-y-1 p-8 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mb-6 shadow-[0px_4px_8px_rgba(0,0,0,0.24)] group-hover:shadow-[0px_6px_12px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-all duration-300">
                <stat.icon className="w-9 h-9 text-white" />
              </div>
              <div className="text-5xl font-extrabold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                {counts[i].toLocaleString()}
                {stat.suffix}
              </div>
              <div className="text-lg text-muted-foreground font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
