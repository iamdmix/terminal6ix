"use client";

import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import Link from "next/link";

export function Header() {
  const navItems = [
    { name: "Challenges", href: "/challenges" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Community", href: "/community" },
    { name: "Host a CTF", href: "/host" },
  ];

  return (
    <header className="w-full py-6 px-6 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary" />
          <span className="text-foreground text-2xl font-extrabold tracking-tight">
            TerminalSix
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-lg text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/signin"
            className="text-lg text-muted-foreground hover:text-primary font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-lg text-primary font-semibold px-5 py-2 rounded-full border border-primary bg-background hover:bg-primary/10 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
