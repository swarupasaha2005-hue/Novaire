"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-nova-black">
      
      {/* Base Deep Atmospheric Glows */}
      <motion.div
        className="absolute top-[-20%] left-[-20%] w-[100vw] h-[100vw] rounded-full mix-blend-screen opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(44, 37, 74, 0.4) 0%, rgba(3, 3, 3, 0) 60%)',
          filter: 'blur(150px)'
        }}
        animate={{
          x: ["0%", "10%", "-5%", "0%"],
          y: ["0%", "10%", "-10%", "0%"],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute bottom-[-20%] right-[-20%] w-[120vw] h-[120vw] rounded-full mix-blend-screen opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(58, 43, 75, 0.3) 0%, rgba(3, 3, 3, 0) 60%)',
          filter: 'blur(180px)'
        }}
        animate={{
          x: ["0%", "-15%", "10%", "0%"],
          y: ["0%", "-10%", "15%", "0%"],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 50, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />

      {/* Layer 1: Deep Slow Sweeping Blur (Cinematic Motion Blur) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-60 mix-blend-screen">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-[200vw] h-[200vh] origin-center rotate-[15deg] scale-150">
          <motion.path
            d="M -20,50 C 20,10 60,90 120,50"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="15"
            strokeLinecap="round"
            filter="blur(12px)"
            animate={{
              d: [
                "M -20,50 C 20,10 60,90 120,50",
                "M -20,40 C 30,20 70,80 120,60",
                "M -20,60 C 10,0 50,100 120,40",
                "M -20,50 C 20,10 60,90 120,50"
              ]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M -20,80 C 40,30 80,120 120,20"
            fill="none"
            stroke="url(#gradient2)"
            strokeWidth="20"
            strokeLinecap="round"
            filter="blur(18px)"
            animate={{
              d: [
                "M -20,80 C 40,30 80,120 120,20",
                "M -20,70 C 50,40 70,100 120,30",
                "M -20,90 C 30,20 90,110 120,10",
                "M -20,80 C 40,30 80,120 120,20"
              ]
            }}
            transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          />
        </svg>
      </div>

      {/* Layer 2: Midground Fluid Trajectories */}
      <div className="absolute inset-0 flex items-center justify-center opacity-70 mix-blend-screen">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-[150vw] h-[150vh] origin-center rotate-[-10deg]">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a3a3a3" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#4B0082" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a3a3a3" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8f8f8" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#8A2BE2" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f8f8f8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="80%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <motion.path
            d="M -10,30 Q 30,-10 60,40 T 110,30"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="3"
            filter="blur(4px)"
            animate={{
              d: [
                "M -10,30 Q 30,-10 60,40 T 110,30",
                "M -10,40 Q 40,0 50,50 T 110,40",
                "M -10,20 Q 20,-20 70,30 T 110,20",
                "M -10,30 Q 30,-10 60,40 T 110,30"
              ]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M -10,60 Q 40,20 70,80 T 110,50"
            fill="none"
            stroke="url(#gradient2)"
            strokeWidth="4"
            filter="blur(6px)"
            animate={{
              d: [
                "M -10,60 Q 40,20 70,80 T 110,50",
                "M -10,50 Q 50,30 60,90 T 110,60",
                "M -10,70 Q 30,10 80,70 T 110,40",
                "M -10,60 Q 40,20 70,80 T 110,50"
              ]
            }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </svg>
      </div>

      {/* Layer 3: Foreground Sharp Light Trails (Flowing Energy) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-90 mix-blend-plus-lighter">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-[120vw] h-[120vh] origin-center rotate-[5deg]">
          {/* Fast sharp trail 1 */}
          <motion.path
            d="M -20,40 Q 40,10 80,60 T 120,40"
            fill="none"
            stroke="url(#trail)"
            strokeWidth="0.5"
            strokeDasharray="200"
            strokeDashoffset="200"
            animate={{
              strokeDashoffset: [200, -200]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          {/* Fast sharp trail 2 */}
          <motion.path
            d="M -20,70 C 20,40 60,90 120,50"
            fill="none"
            stroke="url(#trail)"
            strokeWidth="0.3"
            strokeDasharray="250"
            strokeDashoffset="250"
            animate={{
              strokeDashoffset: [250, -250]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 3 }}
          />
           {/* Fast sharp trail 3 */}
           <motion.path
            d="M -20,20 C 30,50 50,10 120,30"
            fill="none"
            stroke="url(#trail)"
            strokeWidth="0.4"
            strokeDasharray="300"
            strokeDashoffset="300"
            animate={{
              strokeDashoffset: [300, -300]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 1 }}
          />
        </svg>
      </div>

      {/* Foreground Vignette and Noise for depth and editorial feel */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-50" 
        style={{
          backgroundImage: 'radial-gradient(circle at center, transparent 20%, #030303 90%)'
        }}
      />
      <div className="absolute inset-0 bg-nova-black/20 pointer-events-none backdrop-blur-[1px]" />
    </div>
  );
}
