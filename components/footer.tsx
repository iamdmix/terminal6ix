"use client";
import Link from "next/link";
import { Github, MessageCircle, Twitter, Shield } from "lucide-react";

export function Footer() {
  const socialLinks = [
    {
      icon: Github,
      href: "https://github.com/TerminalSix/TerminalSix",
      name: "GitHub",
    },
    {
      icon: MessageCircle,
      href: "https://discord.gg/your-invite",
      name: "Discord",
    },
    {
      icon: Twitter,
      href: "https://twitter.com/your-profile",
      name: "Twitter",
    },
  ];

  return (
    <footer className="py-12 border-t bg-background border-border">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <Shield className="w-7 h-7 text-primary" />
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              TerminalSix
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <link.icon className="w-6 h-6" />
              </Link>
            ))}
          </div>
        </div>

        <div className="pt-8 mt-8 text-center border-t border-border">
          <p className="text-base text-muted-foreground">
            © 2025 TerminalSix. Built by hackers, for hackers.
          </p>
          <p className="text-sm text-muted-foreground/80">
            This project is free & open source, licensed under the MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
