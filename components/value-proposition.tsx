"use client";
import { motion, easeOut } from "framer-motion";
import { Users, Shield, Flag, TrendingUp } from "lucide-react";

const cards = [
  {
    icon: Users,
    title: "Create Teams",
    description: "Sign up and get hacking in minutes.",
  },
  {
    icon: Shield,
    title: "Safe Challenges",
    description: "Isolated containers for every team.",
  },
  {
    icon: Flag,
    title: "Submit Flags",
    description: "Instant validation and scoring.",
  },
  {
    icon: TrendingUp,
    title: "Live Rankings",
    description: "Real-time leaderboard updates.",
  },
];

export function ValueProposition() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut },
    },
  };

  return (
    <section className="relative flex flex-col items-center justify-center w-full px-6 py-20 bg-background">
      {/* Background Gradients */}
      <div className="w-[400px] h-[600px] absolute top-[100px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-25deg] bg-primary/12 blur-[120px] -z-10" />
      <div className="w-[250px] h-[350px] absolute bottom-[80px] right-[15%] origin-center rotate-[35deg] bg-secondary/10 blur-[90px] -z-10" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center w-full max-w-3xl gap-6 mx-auto mb-16"
        >
          <h2 className="w-full text-4xl font-extrabold leading-tight tracking-tight text-center text-foreground md:text-5xl md:leading-[54px]">
            The All-in-One CTF Engine
          </h2>
          <p className="max-w-3xl mx-auto text-xl font-medium leading-tight text-center text-muted-foreground md:text-2xl">
            From seamless registration to real-time scoring, TerminalSix powers
            your entire competition.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              className="group w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out hover:shadow-[0px_8px_16px_rgba(0,0,0,0.2)] hover:scale-[1.02] hover:-translate-y-1 p-8 text-center flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mb-6 mx-auto shadow-[0px_4px_8px_rgba(0,0,0,0.24)] group-hover:shadow-[0px_6px_12px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-all duration-300">
                <card.icon className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3 tracking-wide group-hover:text-primary transition-colors duration-300">
                {card.title}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
