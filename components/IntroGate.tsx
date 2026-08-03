"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Twinkle({ top, left, delay }: { top: string; left: string; delay: number }) {
  return (
    <div
      className="absolute h-1 w-1 rounded-full bg-white animate-twinkle"
      style={{ top, left, animationDelay: `${delay}s` }}
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
  const [opening, setOpening] = useState(false);

  function handleOpen() {
    if (opening) return;
    setOpening(true);
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

      <motion.button
        onClick={handleOpen}
        animate={
          opening
            ? { scale: 45, opacity: 0 }
            : { scale: [1, 1.15, 1], boxShadow: [
                "0 0 40px 10px rgba(246,196,83,0.35)",
                "0 0 70px 22px rgba(246,196,83,0.55)",
                "0 0 40px 10px rgba(246,196,83,0.35)",
              ] }
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

      <AnimatePresence>
        {!opening && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.9 }}
          >
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.35em] text-white/50">
              Untuk {recipientName}
            </p>
            <p className="mx-auto mt-4 max-w-xs font-body text-white/80">
              Ada sesuatu yang menantimu di balik langit ini.
            </p>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-6 font-body text-sm text-gold"
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
