"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
  {
    question: "What is TerminalSix?",
    answer:
      "TerminalSix is a free, open-source platform for hosting and running Capture The Flag (CTF) cybersecurity competitions. It provides dynamic flags, real-time scoring, and secure Docker-based isolation for every team.",
  },
  {
    question: "Who can use TerminalSix?",
    answer:
      "Anyone! TerminalSix is perfect for universities, hacker communities, and organizations looking to run fair, scalable, and secure CTFs. No vendor lock-in, no hidden fees—just open source freedom.",
  },
  {
    question: "How does dynamic flag generation work?",
    answer:
      "Each team gets unique flags for every challenge, making cheating nearly impossible and keeping the competition fair. Flags are generated and validated instantly by the platform.",
  },
  {
    question: "Is TerminalSix secure?",
    answer:
      "Yes. Every challenge runs in an isolated Docker container, and all flag submissions are validated server-side. The platform is open source, so you can audit and improve security as needed.",
  },
  {
    question: "How do I deploy TerminalSix?",
    answer:
      "You can deploy TerminalSix on your own infrastructure, cloud, or even locally for testing. Setup is fast with Docker Compose, and full documentation is available on our GitHub.",
  },
  {
    question: "Can I customize challenges and scoring?",
    answer:
      "Absolutely! TerminalSix supports custom challenge formats, scoring rules, and integrations. You can tailor the event to your needs and even contribute new features to the project.",
  },
];

type FAQItemProps = {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
};

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full overflow-hidden border rounded-lg border-border bg-background/30"
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full gap-5 px-6 py-4 text-left cursor-pointer group"
      >
        <span className="flex-1 text-lg font-medium text-foreground group-hover:text-primary transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180 text-primary" : "rotate-0"
          }`}
          strokeWidth={2.5}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1">
              <p className="leading-relaxed text-muted-foreground">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative flex flex-col items-center justify-center w-full px-6 py-20 bg-background">
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center w-full gap-6 mb-12"
        >
          <h2 className="w-full text-4xl font-extrabold leading-tight text-center break-words text-foreground md:text-5xl md:leading-[54px]">
            Common Questions
          </h2>
          <p className="text-center text-lg font-medium leading-tight text-muted-foreground break-words">
            Everything you need to know about TerminalSix and hosting your own
            CTFs.
          </p>
        </motion.div>
        <div className="flex flex-col w-full gap-4">
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              {...faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
