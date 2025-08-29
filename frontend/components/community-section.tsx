"use client";
import { motion } from "framer-motion";
import { Github, MessageCircle, Twitter } from "lucide-react";
import Link from "next/link";

const communityLinks = [
  {
    icon: MessageCircle,
    title: "Discord",
    description:
      "Join our community for real-time chat, support, and team formation.",
    action: "Join Discord",
    href: "https://discord.gg/your-invite",
    gradient: "from-indigo-500 to-purple-500",
    shadow: "hover:shadow-indigo-500/30",
  },
  {
    icon: Github,
    title: "GitHub",
    description:
      "Contribute to the platform, report issues, or submit your own challenges.",
    action: "View on GitHub",
    href: "https://github.com/TerminalSix/TerminalSix",
    gradient: "from-gray-700 to-gray-900",
    shadow: "hover:shadow-white/20",
  },
  {
    icon: Twitter,
    title: "Twitter (X)",
    description:
      "Stay updated with the latest news, event announcements, and feature releases.",
    action: "Follow Us",
    href: "https://twitter.com/your-profile",
    gradient: "from-sky-500 to-blue-600",
    shadow: "hover:shadow-sky-500/30",
  },
];

export function CommunitySection() {
  return (
    <section className="relative flex flex-col items-center justify-center w-full px-6 py-20 bg-background">
      {/* Background Gradients */}
      <div className="w-[400px] h-[600px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33deg] bg-primary/10 blur-[120px] -z-10" />
      <div className="w-[250px] h-[350px] absolute bottom-[100px] right-[15%] origin-center rotate-[40deg] bg-secondary/8 blur-[90px] -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center w-full max-w-3xl gap-6 mx-auto mb-16"
        >
          <h2 className="w-full text-4xl font-extrabold leading-tight tracking-tight text-center break-words text-foreground md:text-5xl md:leading-[54px]">
            Join The TerminalSix Network
          </h2>
          <p className="max-w-3xl mx-auto text-xl font-medium leading-tight text-center text-muted-foreground break-words">
            Meet other hackers, share strategies, and level up with our
            open-source community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {communityLinks.map((link, index) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: "easeOut",
              }}
              className={`group relative flex flex-col items-center justify-between p-8 text-center bg-[rgba(231,236,235,0.08)] rounded-xl shadow-lg outline outline-1 outline-border transition-all duration-300 hover:-translate-y-2 ${link.shadow} hover:shadow-2xl`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${link.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  <link.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-foreground">
                  {link.title}
                </h3>
                <p className="mb-8 leading-relaxed text-md text-muted-foreground">
                  {link.description}
                </p>
              </div>
              <Link
                href={link.href}
                target="_blank"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium transition-all duration-300 border rounded-lg border-border bg-background/50 text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              >
                {link.action}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
