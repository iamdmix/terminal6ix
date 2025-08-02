"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export function SocialProof() {
  const logos = Array.from({ length: 8 }, (_, i) => ({
    src: `/logos/logo0${i + 1}.svg`,
    alt: `Company Logo ${i + 1}`,
  }));

  return (
    <section className="relative flex flex-col items-center justify-center w-full px-6 py-20 bg-background">
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center w-full max-w-3xl gap-4 mx-auto mb-16"
        >
          <h2 className="w-full text-sm font-bold tracking-widest text-center uppercase text-muted-foreground">
            Trusted by World-Class Organizations
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 justify-items-center gap-8 sm:grid-cols-4">
          {logos.map((logo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, ease: "easeOut" }}
              className="flex items-center justify-center w-full p-6 transition-all duration-300 ease-out"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={40}
                className="object-contain w-full h-auto opacity-60 hover:opacity-100 transition-opacity"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
