"use client";

import { motion } from "framer-motion";

export default function ReactionConsent({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[55] flex items-center justify-center bg-skynight/95 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="glass max-w-sm rounded-3xl px-8 py-9"
      >
        <p className="text-4xl">🎥</p>
        <h2 className="mt-4 font-display text-xl font-bold text-white">
          Mau rekam reaksi kamu?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          Kalau kamu setuju, kamera bakal nyala sebentar (sekitar 9 detik) pas kamu lanjut ke
          halaman berikutnya. Videonya{" "}
          <span className="font-semibold text-gold">otomatis langsung dikirim</span> ke email aku
          abis itu — gak disimpen di HP kamu, di website, atau di mana pun. Kamu juga bisa stop
          kapan aja pas lagi rekam.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onAccept}
            className="rounded-full bg-gold px-6 py-3 font-display font-semibold text-skynight transition-transform active:scale-95"
          >
            Ya, rekam aku 🎥
          </button>
          <button
            onClick={onDecline}
            className="rounded-full border border-white/30 px-6 py-3 text-sm text-white/80 transition-transform active:scale-95"
          >
            Nggak dulu, lanjut aja
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
