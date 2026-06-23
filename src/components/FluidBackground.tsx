"use client";

import { motion } from "framer-motion";

export function FluidBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#030303]">
      {/* 
        Premium monochrome background.
        Pure near-black base. Depth created through:
        - Very subtle top vignette (light bleeds from top centre — editorial lighting)
        - An extremely dim, slow-breathing silver gradient at centre-right
          (draws the eye toward the visual system, creates depth without colour)
        - Film grain noise overlay for tactile texture
        No purple. No fog. No random lines.
      */}

      {/* Top-center editorial highlight — subtle silver bleed from top */}
      <div
        className="absolute top-0 left-0 right-0 h-[35vh] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 55% 0%, rgba(200,200,200,0.035) 0%, rgba(3,3,3,0) 100%)",
        }}
      />

      {/* Right-side depth gradient — pulls attention to the visual */}
      <div
        className="absolute top-0 right-0 w-[70vw] h-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 80% 50%, rgba(130,130,130,0.04) 0%, rgba(3,3,3,0) 70%)",
        }}
      />

      {/* Slow-breathing central depth pulse — extremely dim */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "60%",
          translateX: "-50%",
          translateY: "-50%",
          width: "80vw",
          height: "80vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(160,160,160,0.025) 0%, rgba(3,3,3,0) 65%)",
          filter: "blur(60px)",
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Bottom vignette — grounds the page */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[30vh] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(3,3,3,0.6) 0%, rgba(3,3,3,0) 100%)",
        }}
      />

      {/* Film grain — high quality texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.022,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />
    </div>
  );
}
