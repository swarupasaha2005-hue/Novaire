"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbznVF77kiZfiTop72vwUIjklqnSXbqKM4AX0DRFMrG7SVuKgFr8AWZYU1U5cv1ObaQX/exec";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
        mode: "no-cors",
      });

      console.log("[Novaire Waitlist] Submitted:", email.trim());
      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error("[Novaire Waitlist] Error:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-lg xl:max-w-md relative">
      <AnimatePresence mode="wait">
        {status !== "success" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
              {/* Unified Input + Button */}
              <div className="waitlist-input flex flex-row items-center rounded-lg w-full transition-colors duration-300">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent px-4 sm:px-5 py-3.5 sm:py-4 text-[15px] sm:text-[15px] text-[#F5F5F3] placeholder:text-[rgba(245,245,243,0.35)] outline-none min-w-0"
                  required
                  disabled={status === "submitting"}
                  autoComplete="email"
                  inputMode="email"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="bg-transparent text-[#F5F5F3] border-l border-[rgba(255,255,255,0.12)] text-[13px] sm:text-[14px] font-medium tracking-wide px-5 sm:px-6 py-3.5 sm:py-4 hover:bg-[rgba(255,255,255,0.03)] hover:text-white transition-colors duration-200 disabled:opacity-50 whitespace-nowrap cursor-pointer min-h-[48px]"
                >
                  {status === "submitting" ? "Submitting…" : "Request Early Access"}
                </button>
              </div>

              <p className="text-[12px] sm:text-[13px] font-normal text-[rgba(245,245,243,0.45)] pl-1 mt-1 tracking-wide">
                Priority Access.
              </p>



              <AnimatePresence>
                {errorMsg && (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[12px] text-[rgba(245,120,120,0.8)] pl-0.5"
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col items-start gap-2 py-2"
          >
            <h3 className="font-serif text-xl sm:text-2xl text-[#F5F5F3]">
              Welcome to Novaire.
            </h3>
            <p className="text-[14px] sm:text-[15px] text-[rgba(245,245,243,0.5)] font-light leading-relaxed">
              We&apos;ll notify you when early access begins.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
