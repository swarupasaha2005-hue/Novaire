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
              {/* Input + Button row — stacks on very small screens */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                  placeholder="Enter your email"
                  className="waitlist-input w-full flex-1 rounded-lg
                    px-4 sm:px-5 py-3.5 sm:py-4
                    text-[15px] sm:text-[15px]
                    text-[#F5F5F3] placeholder:text-[rgba(245,245,243,0.35)]
                    outline-none transition-colors duration-200
                    min-h-[48px]"
                  required
                  disabled={status === "submitting"}
                  autoComplete="email"
                  inputMode="email"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full sm:w-auto
                    bg-[#F5F5F3] text-[#0A0A0C]
                    text-[13px] sm:text-[14px] font-medium tracking-wide
                    px-5 sm:px-6 rounded-lg
                    hover:bg-white active:scale-[0.98]
                    transition-all duration-200
                    disabled:opacity-50
                    whitespace-nowrap cursor-pointer
                    min-h-[48px]"
                >
                  {status === "submitting" ? "Submitting…" : "Request Early Access"}
                </button>
              </div>

              <p className="text-[11px] sm:text-[12px] text-[rgba(245,245,243,0.38)] pl-0.5 tracking-wide">
                Launch updates only.
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
