"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FALLBACK_WORDS = ["Kamu keren, jangan lupa itu."];

export default function SweetWords({ words }: { words: string[] }) {
  const list = words && words.length > 0 ? words : FALLBACK_WORDS;
  const [index, setIndex] = useState<number | null>(null);

  function next() {
    let newIndex = Math.floor(Math.random() * list.length);
    if (list.length > 1 && newIndex === index) {
      newIndex = (newIndex + 1) % list.length;
    }
    setIndex(newIndex);
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6 text-center">
      <div className="glass flex min-h-[110px] w-full items-center justify-center rounded-3xl px-6 py-6">
        <AnimatePresence mode="wait">
          {index === null ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-white/50"
            >
              Tekan tombolnya buat lihat.
            </motion.p>
          ) : (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="font-body text-[15px] leading-relaxed text-white/90"
            >
              {list[index]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={next}
        className="rounded-full bg-gold px-8 py-3 font-display font-semibold text-skynight transition-transform active:scale-95"
      >
        Kasih kata-kata manis lagi ✨
      </button>
    </div>
  );
}
