"use client";

import Link from "next/link";

export function FloatingTopBar() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-3xl px-6 py-3 flex items-center justify-between bg-[rgba(120,60,255,0.18)] backdrop-blur-md border border-[rgba(231,236,235,0.18)] shadow-[0px_2px_8px_rgba(120,60,255,0.10)] rounded-full text-foreground font-medium text-base select-none">
      <span>
        🚀 TerminalSix is{" "}
        <span className="font-bold text-primary">open source</span> & free for
        all hackers!
      </span>
      <Link
        href="https://github.com/TerminalSix/TerminalSix"
        target="_blank"
        rel="noopener"
        className="ml-4 px-4 py-1 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow hover:scale-105 transition-transform"
      >
        GitHub
      </Link>
    </div>
  );
}
