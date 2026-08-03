"use client";

import { motion } from "framer-motion";

const CONFETTI_COLORS = ["#F6C453", "#FFD6E0", "#8FD3F4", "#4FA9E0", "#FFFFFF"];
const BALLOON_COLORS = ["#F6C453", "#FFD6E0", "#8FD3F4"];

function ConfettiPiece({
  left,
  delay,
  duration,
  color,
  round,
}: {
  left: string;
  delay: number;
  duration: number;
  color: string;
  round?: boolean;
}) {
  return (
    <motion.div
      className={round ? "absolute top-0 h-2.5 w-2.5 rounded-full" : "absolute top-0 h-3 w-2 rounded-sm"}
      style={{ left, backgroundColor: color }}
      initial={{ y: -40, opacity: 0, rotate: 0 }}
      animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 360 }}
      transition={{ duration, delay, ease: "easeIn" }}
    />
  );
}

function Balloon({
  left,
  color,
  delay,
  duration,
  size,
}: {
  left: string;
  color: string;
  delay: number;
  duration: number;
  size: number;
}) {
  return (
    <motion.div
      className="absolute bottom-0 opacity-0"
      style={{ left }}
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: "-125vh", opacity: [0, 1, 1, 0.9, 0], x: [0, 14, -14, 8, 0] }}
      transition={{ duration, delay, ease: "easeInOut" }}
    >
      <svg width={size} height={size * 1.35} viewBox="0 0 40 54" fill="none">
        <ellipse cx="20" cy="20" rx="18" ry="20" fill={color} opacity={0.92} />
        <ellipse cx="14" cy="12" rx="5" ry="7" fill="white" opacity={0.25} />
        <path d="M17 39 L20 44 L23 39" fill={color} opacity={0.92} />
        <line x1="20" y1="44" x2="20" y2="54" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      </svg>
    </motion.div>
  );
}

function Sparkle({ top, left, delay, size }: { top: string; left: string; delay: number; size: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#F6C453"
      className="absolute"
      style={{ top, left }}
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4], rotate: [0, 90] }}
      transition={{ duration: 2.2, delay, repeat: Infinity, repeatDelay: 1.2 }}
    >
      <path d="M12 0l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" />
    </motion.svg>
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
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-skynight/90 px-6 backdrop-blur-sm"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <ConfettiPiece
            key={i}
            left={`${Math.random() * 100}%`}
            delay={Math.random() * 1.6}
            duration={2.4 + Math.random() * 2.2}
            color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
            round={i % 3 === 0}
          />
        ))}
        <Balloon left="12%" color={BALLOON_COLORS[0]} delay={0.2} duration={6.5} size={46} />
        <Balloon left="78%" color={BALLOON_COLORS[1]} delay={0.9} duration={7.2} size={40} />
        <Balloon left="45%" color={BALLOON_COLORS[2]} delay={1.6} duration={6.8} size={38} />
      </div>

      {/* soft golden glow behind card */}
      <div className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-gold/25 blur-[100px]" />

      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.2 }}
        className="glass relative z-10 max-w-sm overflow-visible rounded-3xl px-8 py-10 text-center shadow-[0_0_80px_rgba(246,196,83,0.25)]"
      >
        <Sparkle top="-6%" left="8%" delay={0} size={18} />
        <Sparkle top="-2%" left="82%" delay={0.6} size={14} />
        <Sparkle top="88%" left="90%" delay={1.1} size={16} />
        <Sparkle top="92%" left="4%" delay={0.3} size={12} />

        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1 }}
          className="text-6xl"
        >
          🎉
        </motion.div>

        <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-gold">
          Hari ini spesial
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold text-white text-shadow-soft sm:text-3xl">
          Selamat Ulang Tahun,
        </h2>
        <motion.p
          animate={{ textShadow: ["0 0 20px rgba(246,196,83,0.3)", "0 0 40px rgba(246,196,83,0.6)", "0 0 20px rgba(246,196,83,0.3)"] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="mt-1 font-script text-5xl text-white"
        >
          {recipientName}
        </motion.p>
        <p className="mt-4 text-sm leading-relaxed text-white/80">
          Semoga tahun ini banyak hal baik dateng ke kamu. Masih ada kejutan lain nunggu di bawah.
        </p>

        <motion.button
          onClick={onClose}
          whileTap={{ scale: 0.93 }}
          animate={{ boxShadow: ["0 0 0px rgba(246,196,83,0.4)", "0 0 24px rgba(246,196,83,0.6)", "0 0 0px rgba(246,196,83,0.4)"] }}
          transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
          className="mt-6 rounded-full bg-gold px-8 py-3 font-display font-semibold text-skynight"
        >
          Ayo lihat ↓
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
