"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createAudioContext, scheduleCelebrationChime } from "@/lib/sound";

const TEASER_LINES = [
  "Psst...",
  "Ada sesuatu yang udah aku siapin,",
  "khusus buat kamu, malam ini.",
];

function Twinkle({ top, left, delay }: { top: string; left: string; delay: number }) {
  return (
    <div
      className="absolute h-1 w-1 rounded-full bg-white animate-twinkle"
      style={{ top, left, animationDelay: `${delay}s` }}
    />
  );
}

function ShootingStar() {
  return (
    <motion.div
      className="pointer-events-none absolute h-px w-28 rounded-full bg-gradient-to-r from-transparent via-white to-transparent"
      style={{ top: "16%", left: "-15%" }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ x: "130vw", y: "35vh", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.5, delay: 2.6, ease: "easeIn" }}
    />
  );
}

export default function IntroGate({
  recipientName,
  onOpen,
}: {
  recipientName: string;
  onOpen: () => void;
}) {
  const [lineIndex, setLineIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (lineIndex < TEASER_LINES.length) {
      const t = setTimeout(() => setLineIndex((i) => i + 1), 1700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(t);
  }, [lineIndex]);

  function handleOpen() {
    if (!ready || opening) return;
    setOpening(true);
    try {
      const ctx = createAudioContext();
      if (ctx) {
        ctx.resume();
        scheduleCelebrationChime(ctx, 1.15);
      }
    } catch {
      // audio is a nice-to-have; ignore if unsupported
    }
    window.setTimeout(onOpen, 1150);
  }

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-skynight px-6 text-center"
    >
      <div className="absolute inset-0">
        {Array.from({ length: 55 }).map((_, i) => (
          <Twinkle
            key={i}
            top={`${Math.random() * 100}%`}
            left={`${Math.random() * 100}%`}
            delay={Math.random() * 3}
          />
        ))}
      </div>

      <motion.div
        className="pointer-events-none absolute h-[320px] w-[320px] rounded-full bg-gold/10 blur-[90px]"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {!ready && <ShootingStar />}

      {/* teaser lines */}
      <div className="relative z-10 flex h-20 items-center justify-center">
        <AnimatePresence mode="wait">
          {!ready && lineIndex < TEASER_LINES.length && (
            <motion.p
              key={lineIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="max-w-xs font-body text-lg text-white/90"
            >
              {TEASER_LINES[lineIndex]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* star */}
      <AnimatePresence>
        {ready && (
          <motion.button
            key="star"
            onClick={handleOpen}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={
              opening
                ? { scale: 45, opacity: 0 }
                : {
                    opacity: 1,
                    scale: [1, 1.15, 1],
                    boxShadow: [
                      "0 0 40px 10px rgba(246,196,83,0.35)",
                      "0 0 70px 22px rgba(246,196,83,0.55)",
                      "0 0 40px 10px rgba(246,196,83,0.35)",
                    ],
                  }
            }
            transition={
              opening
                ? { duration: 1, ease: "easeIn" }
                : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
            }
            className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gold"
            aria-label="Buka kejutannya"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#0B2A4A">
              <path d="M12 2l2.6 6.9L22 11l-7.4 2.1L12 20l-2.6-6.9L2 11l7.4-2.1L12 2z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ready && !opening && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.35em] text-white/50">
              Untuk {recipientName}
            </p>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-4 font-body text-sm text-gold"
            >
              Ketuk bintangnya untuk membuka ✨
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {opening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.55 }}
          className="pointer-events-none absolute inset-0 bg-white"
        />
      )}
    </motion.div>
  );
}
