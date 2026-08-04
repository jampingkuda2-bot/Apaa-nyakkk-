"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createAudioContext, scheduleCelebrationChime, playBlip } from "@/lib/sound";
import { vibrate } from "@/lib/haptics";

const TEASER_LINES = [
  "sayaaang...",
  "Sebelummm lanjuttt,",
  "ada sesuatuuu yang udah aku siapin diam-diam loh 👀",
  "tapi sabarr sekkk...",
  "kamu kudu sabarf benn ga pesekk~",
];

const REQUIRED_TAPS = 3;
const TAP_HINTS = [
  "Ketuk bintangnyaaa buat buka ✨",
  "Sekali lagiii dong...",
  "Satu ketukan terakhirrr, sayangg!",
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
      transition={{ duration: 1.5, delay: 3.4, ease: "easeIn" }}
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
  const [tapCount, setTapCount] = useState(0);
  const [bump, setBump] = useState(0);
  const [opening, setOpening] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (lineIndex < TEASER_LINES.length) {
      const t = setTimeout(() => setLineIndex((i) => i + 1), 1900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(t);
  }, [lineIndex]);

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioContext();
    }
    return audioCtxRef.current;
  }

  function handleTap() {
    if (!ready || opening) return;
    const nextCount = tapCount + 1;

    const ctx = getAudioCtx();
    if (ctx) {
      ctx.resume();
      if (nextCount < REQUIRED_TAPS) playBlip(ctx, 620 + nextCount * 160);
    }

    if (nextCount >= REQUIRED_TAPS) {
      setOpening(true);
      vibrate([25, 40, 25, 40, 70]);
      if (ctx) scheduleCelebrationChime(ctx, 1.15);
      window.setTimeout(onOpen, 1150);
      return;
    }

    vibrate(14);
    setTapCount(nextCount);
    setBump((b) => b + 1);
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

      <div className="relative z-10 flex h-24 items-center justify-center">
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

      <AnimatePresence>
        {ready && (
          <motion.button
            key={`star-${bump}`}
            onClick={handleTap}
            whileTap={{ scale: 0.85 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={
              opening
                ? { scale: 45, opacity: 0 }
                : {
                    opacity: 1,
                    scale: [1 + tapCount * 0.08, 1.18 + tapCount * 0.08, 1 + tapCount * 0.08],
                    boxShadow: [
                      `0 0 ${40 + tapCount * 18}px ${10 + tapCount * 6}px rgba(246,196,83,${0.35 + tapCount * 0.15})`,
                      `0 0 ${75 + tapCount * 18}px ${24 + tapCount * 6}px rgba(246,196,83,${0.6 + tapCount * 0.15})`,
                      `0 0 ${40 + tapCount * 18}px ${10 + tapCount * 6}px rgba(246,196,83,${0.35 + tapCount * 0.15})`,
                    ],
                  }
            }
            transition={
              opening
                ? { duration: 1, ease: "easeIn" }
                : { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }
            className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gold"
            aria-label="Ketuk bintang"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#123A5E">
              <path d="M12 2l2.6 6.9L22 11l-7.4 2.1L12 20l-2.6-6.9L2 11l7.4-2.1L12 2z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {ready && !opening && (
          <motion.div
            key={tapCount}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.35em] text-white/50">
              Untuk {recipientName}
            </p>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="mt-4 font-body text-sm text-gold"
            >
              {TAP_HINTS[tapCount]}
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
