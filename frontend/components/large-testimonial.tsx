"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export function LargeTestimonial() {
  return (
    <section className="w-full py-20 px-6 relative flex flex-col justify-center items-center bg-background">
      {/* Aurora Background */}
      <div className="w-[350px] h-[500px] absolute top-[100px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-30deg] bg-primary/10 blur-[120px] z-0" />
      <div className="w-[200px] h-[300px] absolute bottom-[80px] right-[15%] origin-center rotate-[40deg] bg-secondary/8 blur-[90px] z-0" />
      <div className="w-[150px] h-[200px] absolute top-[60px] left-[20%] origin-center rotate-[20deg] bg-accent/6 blur-[70px] z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full mx-auto relative z-10"
      >
        <div className="w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out hover:shadow-[0px_8px_16px_rgba(0,0,0,0.2)] hover:scale-[1.01] p-10 md:p-16 flex flex-col items-center gap-10">
          <div className="w-full text-center text-foreground font-medium text-2xl md:text-3xl lg:text-4xl leading-tight md:leading-snug lg:leading-snug">
            &ldquo;TerminalSix made hosting our CTF painless. Setup took
            minutes, and the participants loved the experience. This is how CTFs
            should be.&rdquo;
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-5">
            <Image
              src="/images/guillermo-rauch.png"
              alt="University Cybersecurity Club Lead avatar"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full border border-primary/20 shadow-[0px_2px_4px_rgba(0,0,0,0.16)]"
            />
            <div className="flex flex-col items-center md:items-start">
              <div className="text-foreground text-lg font-semibold leading-6">
                Lead, University Cybersecurity Club
              </div>
              <div className="text-muted-foreground text-base font-normal leading-6">
                CTF Organizer
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
