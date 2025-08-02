"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function DashboardPreview() {
  return (
    <section className="relative flex flex-col items-center justify-center w-full px-6 py-20 bg-background">
      {/* Background Gradients */}
      <div className="w-[400px] h-[600px] absolute top-[100px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-35deg] bg-primary/8 blur-[120px] -z-10" />
      <div className="w-[250px] h-[350px] absolute bottom-[80px] right-[12%] origin-center rotate-[45deg] bg-secondary/6 blur-[90px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex items-center justify-center w-full max-w-6xl mx-auto"
      >
        <div className="group w-full overflow-hidden rounded-[10px] bg-[rgba(231,236,235,0.08)] p-2 shadow-[0px_4px_16px_rgba(0,0,0,0.24)] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out hover:scale-[1.01] hover:shadow-[0px_12px_24px_rgba(0,0,0,0.3)] md:p-4">
          <div className="relative w-full max-h-[550px] overflow-hidden rounded-[6px] border border-primary/20">
            <Image
              src="/images/dashboard-preview.png"
              alt="TerminalSix Dashboard Preview"
              width={1160}
              height={700}
              className="object-cover w-full h-auto"
              priority
            />
            {/* Refined gradient for a smoother fade */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-background/90 to-transparent" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
