import React from 'react';
import { motion } from 'framer-motion';

export interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function SectionCard({ children, className = '', delay = 0 }: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition-all duration-200 hover:border-[#43D18C] hover:shadow-[0_0_18px_rgba(67,209,140,0.18)] ${className}`}
      style={{ padding: '24px' }}
    >
      {children}
    </motion.div>
  );
}
