"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

interface FeatureProps {
  title: string;
  body: string;
  link: string;
  icon: React.ReactNode;
  imageSrc: string;
}

function FeatureCard({ title, body, link, icon, imageSrc }: FeatureProps) {
  return (
    <motion.div 
      className="card reveal relative overflow-hidden"
      initial={{ 
        borderColor: "rgba(255, 255, 255, 0.08)",
        backgroundColor: "#111111",
        y: 0
      }}
      whileHover={{ 
        borderColor: "rgba(62,207,142,0.4)",
        backgroundColor: "#131313",
        y: -6
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Decorative Emerald Glow */}
      <motion.div 
        className="absolute -right-8 -top-8 w-[200px] h-[200px] rounded-full bg-[#3ECF8E] blur-[70px] pointer-events-none z-0"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.10 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
      
      {/* Ambient Radial Artwork Layer */}
      <div 
        className="absolute -top-12 -right-12 w-[220px] h-[220px] z-0 pointer-events-none mix-blend-screen"
        style={{ 
          maskImage: 'radial-gradient(circle at 50% 50%, black 10%, transparent 65%)', 
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 10%, transparent 65%)' 
        }}
      >
        <motion.img
          src={imageSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-contain blur-[3px]"
          initial={{ opacity: 0.08, scale: 1 }}
          whileHover={{ opacity: 0.15, scale: 1.08 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ transformOrigin: "center center" }}
        />
      </div>

      {/* Dark Overlay for Depth */}
      <div className="absolute inset-0 z-[5] bg-black/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full pointer-events-auto">
        <div className="card-icon">
          {icon}
        </div>
        <div className="card-title">{title}</div>
        <div className="card-body">{body}</div>
        <a href="#" className="card-link">{link}</a>
      </div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section className="ways-section">
      <div className="container">
        <span className="section-label reveal">ONE PROTOCOL</span>
        <h2 className="section-heading reveal">
          Multiple ways<br />
          <span className="playfair">to earn.</span>
        </h2>
        <div className="cards-grid">
          <FeatureCard 
            title="Lock Fixed Yield"
            body="Receive PT tokens and know your return upfront."
            link="Learn more ↗"
            imageSrc="/images/fixed-yield.png"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 9v6M9 12h6" />
              </svg>
            }
          />
          <FeatureCard 
            title="Earn Variable Yield"
            body="Hold YT tokens and capture the upside of future yield."
            link="Learn more ↗"
            imageSrc="/images/variable-yield.png"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12h4l3-8 4 16 3-8h4" />
              </svg>
            }
          />
          <FeatureCard 
            title="Automate Everything"
            body="Smart Accounts execute, rollover, and compound so you don't have to."
            link="Learn more ↗"
            imageSrc="/images/automation.png"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2l8 14H4z" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
}
