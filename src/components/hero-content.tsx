"use client";

import { motion, Variants } from "framer-motion";
import { WaitlistForm } from "./waitlist-form";

export function HeroContent() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-10 flex flex-col justify-center w-full max-w-5xl mx-auto px-6 sm:px-12 lg:px-24 h-full"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-nova-silver/20 bg-nova-black/50 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-nova-silver mr-2 shadow-[0_0_8px_rgba(163,163,163,0.8)]" />
          <span className="text-xs uppercase tracking-[0.2em] text-nova-silver/80 font-sans">
            Built on Stellar
          </span>
        </div>
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.1] tracking-tight text-nova-white mb-8"
      >
        <span className="block">Invest by Goal.</span>
        <span className="block text-nova-silver/80 italic">Not by DeFi Complexity.</span>
      </motion.h1>

      <motion.div variants={itemVariants} className="max-w-2xl">
        <p className="text-lg sm:text-xl text-nova-silver/70 font-sans leading-relaxed tracking-wide font-light">
          The first Intent-Based Fixed Income Operating System.
          <br className="hidden sm:block" />
          Define your goal. Novaire manages the rest.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-4">
        <WaitlistForm />
      </motion.div>
    </motion.div>
  );
}
