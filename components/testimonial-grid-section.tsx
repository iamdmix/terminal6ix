"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "TerminalSix made hosting our university CTF a breeze. The dynamic flags and instant scoring kept everyone engaged!",
    name: "Priya Sharma",
    company: "Cybersecurity Club, IIT Bombay",
    avatar: "/images/avatars/annette-black.png",
    type: "large-teal",
  },
  {
    quote:
      "We ran a national hackathon with TerminalSix. The Docker isolation and real-time leaderboard were flawless.",
    name: "Alex Kim",
    company: "CTF Organizer, HackSoc UK",
    avatar: "/images/avatars/dianne-russell.png",
    type: "small-dark",
  },
  {
    quote:
      "No more cheating! Dynamic flags per team made our event fair and fun. Highly recommend TerminalSix.",
    name: "Fatima Al-Mansoori",
    company: "CTF Lead, UAE Cyber League",
    avatar: "/images/avatars/cameron-williamson.png",
    type: "small-dark",
  },
  {
    quote:
      "Open source, easy to deploy, and the community support is amazing. TerminalSix is the future of CTFs.",
    name: "Lucas Meyer",
    company: "Security Researcher, ETH Zurich",
    avatar: "/images/avatars/robert-fox.png",
    type: "small-dark",
  },
  {
    quote:
      "We hosted 500+ hackers with zero downtime. The platform scaled perfectly and the leaderboard was a hit!",
    name: "Emily Chen",
    company: "CTF Admin, Stanford",
    avatar: "/images/avatars/darlene-robertson.png",
    type: "small-dark",
  },
  {
    quote:
      "TerminalSix’s instant flag validation and isolated sandboxes made our event secure and fair for all teams.",
    name: "Mohammed El-Sayed",
    company: "CTF Host, Cairo University",
    avatar: "/images/avatars/cody-fisher.png",
    type: "small-dark",
  },
  {
    quote:
      "We switched to TerminalSix for our annual CTF and never looked back. Setup was fast and support was top-notch.",
    name: "Sofia Rossi",
    company: "CTF Organizer, Politecnico di Milano",
    avatar: "/images/avatars/albert-flores.png",
    type: "large-light",
  },
];

type TestimonialCardProps = {
  quote: string;
  name: string;
  company: string;
  avatar: string;
  type: string;
};

const TestimonialCard = ({
  quote,
  name,
  company,
  avatar,
  type,
}: TestimonialCardProps) => {
  const isLargeCard = type.startsWith("large");
  const avatarSize = isLargeCard ? 48 : 36;
  const avatarBorderRadius = isLargeCard
    ? "rounded-[41px]"
    : "rounded-[30.75px]";
  const padding = isLargeCard ? "p-8" : "p-[30px]";

  let cardClasses = `flex flex-col justify-between items-start overflow-hidden rounded-[10px] shadow-[0px_4px_8px_rgba(0,0,0,0.16)] relative ${padding}`;
  let quoteClasses = "";
  let nameClasses = "";
  let companyClasses = "";
  let backgroundElements = null;

  if (type === "large-teal") {
    cardClasses += " bg-primary";
    quoteClasses += " text-primary-foreground text-2xl font-medium leading-8";
    nameClasses += " text-primary-foreground text-base font-normal leading-6";
    companyClasses +=
      " text-primary-foreground/80 text-base font-normal leading-6";
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('/images/large-card-background.svg')" }}
      />
    );
  } else if (type === "large-light") {
    cardClasses += " bg-secondary-foreground/5";
    quoteClasses += " text-foreground text-2xl font-medium leading-8";
    nameClasses += " text-foreground text-base font-normal leading-6";
    companyClasses += " text-muted-foreground text-base font-normal leading-6";
  } else {
    cardClasses +=
      " bg-card outline outline-1 outline-border outline-offset-[-1px]";
    quoteClasses += " text-foreground/80 text-[17px] font-normal leading-6";
    nameClasses += " text-foreground text-sm font-normal leading-[22px]";
    companyClasses +=
      " text-muted-foreground text-sm font-normal leading-[22px]";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full h-full"
    >
      <div className={`${cardClasses} h-full`}>
        {backgroundElements}
        <div
          className={`relative z-10 font-normal break-words ${quoteClasses}`}
        >
          {quote}
        </div>
        <div className="relative z-10 flex justify-start items-center gap-3 pt-6">
          <Image
            src={avatar || "/placeholder.svg"}
            alt={`${name} avatar`}
            width={avatarSize}
            height={avatarSize}
            className={`${avatarBorderRadius}`}
            style={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
              width: `${avatarSize}px`,
              height: `${avatarSize}px`,
            }}
          />
          <div className="flex flex-col justify-start items-start gap-0.5">
            <div className={nameClasses}>{name}</div>
            <div className={companyClasses}>{company}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function TestimonialGridSection() {
  return (
    <section className="relative flex flex-col items-center justify-center w-full px-6 py-20 overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="w-[400px] h-[600px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33deg] bg-primary/10 blur-[120px] -z-10" />
      <div className="w-[250px] h-[350px] absolute bottom-[100px] right-[15%] origin-center rotate-[40deg] bg-secondary/10 blur-[90px] -z-10" />

      <div className="relative z-10 w-full max-w-4xl mx-auto mb-16 text-center">
        <h2 className="text-4xl font-extrabold leading-tight text-foreground md:text-5xl md:leading-[54px]">
          Loved by Organizers Worldwide
        </h2>
        <p className="max-w-2xl mx-auto mt-6 text-lg font-medium leading-tight text-muted-foreground md:text-xl">
          Hear how TerminalSix powers secure and scalable competitions for
          universities and hacker communities.
        </p>
      </div>

      {/* Masonry layout using flexbox columns */}
      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 gap-6 mx-auto md:grid-cols-3">
        {/* Use grid with specific row spans for a masonry effect that's responsive */}
        <div className="md:col-span-1 md:row-span-2">
          <TestimonialCard {...testimonials[0]} />
        </div>
        <div className="md:col-span-1 md:row-span-1">
          <TestimonialCard {...testimonials[1]} />
        </div>
        <div className="md:col-span-1 md:row-span-1">
          <TestimonialCard {...testimonials[2]} />
        </div>
        <div className="md:col-span-1 md:row-span-1">
          <TestimonialCard {...testimonials[3]} />
        </div>
        <div className="md:col-span-1 md:row-span-2">
          <TestimonialCard {...testimonials[6]} />
        </div>
        <div className="md:col-span-1 md:row-span-1">
          <TestimonialCard {...testimonials[4]} />
        </div>
        <div className="md:col-span-1 md:row-span-1">
          <TestimonialCard {...testimonials[5]} />
        </div>
      </div>
    </section>
  );
}
