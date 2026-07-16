"use client";

import React from "react";
import { motion } from "framer-motion";
import TiltCard from "@/components/TiltCard";
import { Sparkles, BookOpen, Target, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Study Materials",
    description: "Access high-tier notes, lesson plans, and resources loaded instantly.",
    icon: <BookOpen className="h-6 w-6 text-secondary" />
  },
  {
    title: "Practice Tests",
    description: "Track your stats with quizzes and mock exams built for competitive improvement.",
    icon: <Target className="h-6 w-6 text-accent" />
  },
  {
    title: "Student Support",
    description: "Stay connected with your squad. Guidance and learning tools provided.",
    icon: <Users className="h-6 w-6 text-primary" />
  },
];

export default function Home() {
  return (
    <div className="min-h-screen text-foreground overflow-hidden">
      <main className="mx-auto flex max-w-7xl flex-col px-6 py-16 sm:px-8 lg:px-12 lg:py-24 relative z-10">
        
        {/* Floating Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative rounded-[2rem] glass-panel p-8 sm:p-12 lg:p-20 overflow-hidden"
        >
          {/* Animated glow orb behind text */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse" />

          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between relative z-10">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/50 bg-secondary/10 px-4 py-1.5 text-xs font-black tracking-widest text-secondary shadow-[0_0_15px_rgba(6,182,212,0.3)] uppercase"
              >
                <Sparkles className="h-4 w-4" />
                NTR Study Hub
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl font-black leading-[1.1] sm:text-6xl tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-lg"
              >
                ELEVATE YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">ACADEMIC PROTOCOL</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-lg leading-8 text-gray-400 font-medium max-w-xl"
              >
                A high-performance digital space engineered for students. Initialize your learning modules, track progression, and access critical data resources instantly.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <Link
                  href="/courses"
                  className="group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                >
                  Initialize Curriculum
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 rounded-xl border border-white/20"></div>
                </Link>
                <Link
                  href="#features"
                  className="group flex items-center justify-center rounded-xl border border-gray-600 bg-black/40 px-8 py-4 text-sm font-black uppercase tracking-widest text-gray-300 transition-all hover:border-gray-400 hover:bg-white/5 hover:text-white"
                >
                  View Details
                </Link>
              </motion.div>
            </div>

            <TiltCard maxTilt={15} className="lg:min-w-[380px]">
              <div className="rounded-[2rem] bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8 shadow-2xl relative overflow-hidden group">
                {/* Glare effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-2 w-2 rounded-full bg-accent animate-ping"></div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">
                    System Active
                  </p>
                </div>
                
                <h2 className="text-2xl font-black tracking-tight text-white">Daily Objectives</h2>
                <ul className="mt-6 space-y-4 text-sm font-semibold text-gray-400">
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center border border-primary/50 text-primary">01</div>
                    Acquire structured study resources
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-secondary/20 flex items-center justify-center border border-secondary/50 text-secondary">02</div>
                    Execute practice protocols
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-accent/20 flex items-center justify-center border border-accent/50 text-accent">03</div>
                    Maintain competitive edge
                  </li>
                </ul>
              </div>
            </TiltCard>
          </div>
        </motion.section>

        {/* Floating Features Grid */}
        <section id="features" className="mt-16 grid gap-6 md:grid-cols-3 perspective-container">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
            >
              <TiltCard maxTilt={10} glow={false}>
                <article className="rounded-2xl glass-panel p-8 h-full transition-colors hover:bg-white/5 border border-white/10 hover:border-white/20">
                  <div className="mb-4 inline-flex p-3 rounded-xl bg-black/40 border border-gray-800 shadow-inner">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-white mb-3">{feature.title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-gray-400">{feature.description}</p>
                </article>
              </TiltCard>
            </motion.div>
          ))}
        </section>

      </main>
    </div>
  );
}
