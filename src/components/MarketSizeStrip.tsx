"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const stats = [
  { num: "01", label: "Stellar Stablecoins", value: "$800M+ on-chain" },
  { num: "02", label: "Fixed Income DeFi", value: "$3B+ global TVL" },
  { num: "03", label: "SCF Grant Round", value: "$10M+ deployed to builders" },
  { num: "04", label: "Average User Need", value: "Set-and-forget yield" },
];

export function MarketSizeStrip() {
  return (
    <section className="w-full px-6 py-24 lg:px-12 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto overflow-x-auto pb-8 hide-scrollbar">
        <div className="flex md:grid md:grid-cols-4 gap-6 min-w-[800px] md:min-w-0">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
              className="flex-1 flex flex-col justify-between p-6 border-t border-nova-border/50 hover:bg-nova-surface/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="text-xs font-sans text-nova-muted tracking-widest">{stat.num}</span>
                <ArrowUpRight className="w-4 h-4 text-nova-muted" />
              </div>
              <div>
                <p className="text-nova-muted text-sm mb-1">{stat.label}</p>
                <p className="text-nova-text font-serif text-2xl">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
