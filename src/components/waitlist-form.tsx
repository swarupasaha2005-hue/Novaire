"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("submitting");
    
    // Mock API call
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mt-12 relative h-16">
      <AnimatePresence mode="wait">
        {status !== "success" ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="absolute inset-0"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-nova-indigo/30 to-nova-violet/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-nova-black border border-nova-silver/20 rounded-lg overflow-hidden focus-within:border-nova-silver/50 transition-colors duration-500">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Request Early Access"
                  className="w-full bg-transparent text-nova-white placeholder-nova-silver/60 px-6 py-4 outline-none font-sans text-sm tracking-wide"
                  required
                  disabled={status === "submitting"}
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="px-6 py-4 text-nova-silver hover:text-nova-white transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="mt-4 text-xs text-nova-silver/60 font-sans tracking-widest uppercase">
              Launch updates only.
            </p>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col items-start justify-center"
          >
            <div className="flex items-center space-x-3 text-nova-white">
              <div className="w-6 h-6 rounded-full bg-nova-white/10 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <span className="font-serif italic text-lg tracking-wide">Welcome to Novaire.</span>
            </div>
            <p className="mt-3 text-sm text-nova-silver/80 font-sans tracking-wide">
              We&apos;ll notify you when early access begins.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
