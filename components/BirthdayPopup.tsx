"use client";

import { motion } from "framer-motion";

const CONFETTI_COLORS = ["#F6C453", "#FFD6E0", "#8FD3F4", "#4FA9E0", "#FFFFFF"];

function ConfettiPiece({
  left,
  delay,
  duration,
  color,
}: {
  left: string;
  delay: number;
  duration: number;
  color: string;
}) {
  return (
    <motion.div
      className="absolute top-0 h-3 w-2 rounded-sm"
      style={{ left, backgroundColor: color }}
      initial={{ y: -40, opacity: 0, rotate: 0 }}
      animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 360 }}
      transition={{ duration, delay, ease: "easeIn" }}
    />
  );
}

export default function BirthdayPopup({
  recipientName,
  onClose,
}: {
  recipientName: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-skynight/85 px-6 backdrop-blur-sm"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 45 }).map((_, i) => (
          <ConfettiPiece
            key={i}
            left={`${Math.random() * 100}%`}
            delay={Math.random() * 1.4}
            duration={2.4 + Math.random() * 2}
            color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.2 }}
        className="glass relative z-10 max-w-sm rounded-3xl px-8 py-10 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1 }}
          className="text-5xl"
        >
          🎉
        </motion.div>

        <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-gold">
          Hari ini spesial
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold text-white text-shadow-soft sm:text-3xl">
          Selamat Ulang Tahun Sayangggg,
        </h2>
        <p className="mt-1 font-script text-5xl text-white text-shadow-soft">{recipientName}</p>
        <p className="mt-4 text-sm leading-relaxed text-white/80">
          Semoga tahun ini penuh hal-hal baik buat kamu. Masih ada kejutan lagi di bawah sana.
        </p>

        <button
          onClick={onClose}
          className="mt-6 rounded-full bg-gold px-8 py-3 font-display font-semibold text-skynight transition hover:brightness-105 active:scale-95"
        >
          Lihat kejutannya ↓
        </button>
      </motion.div>
    </motion.div>
  );
}
