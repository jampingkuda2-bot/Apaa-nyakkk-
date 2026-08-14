"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SWEET_WORDS = [
  "Kamu tu gatauu kenapa selalu bikin hari yang biasa aja jadi mendingan.",
  "Aku tuu suka banget sama cara kamu, walau kamu sendiri mungkin gaa sadar.",
  "Semoga kamu selalu dikelilingi orang-orang yang sayang kamu sebanyak aku sayang kamu.",
  "Kadang aku mikir, untung banget ya waktu itu kita ketemu di Roblox.",
  "Kamu itu capee boleh kesell, tapii jangan nyerah.",
  "Aku gak butuh alasan buat sayang kamu, tapi kalau dipaksa nyari, bakal kepanjangan.",
  "Semoga apapun yang lagi kamu khawatirin, pelan-pelan ketemu jalan keluarnya.",
  "Kamu pantas dapet hal-hal baik, jangan lupain itu.",
  "Aku suka versi kamu yang lagi jadi diri sendiri, bukan yang lagi capeee jadi kuat.",
  "Kalau kamu lagi ngerasa kurang, inget aku selalu ngerasa kamu udah lebih dari cukup.",
  "Makasih ya udah bertahan sejauh ini, aku bangga sama kamu sayangg.",
  "Semoga tahun ini kamu lebih sering ketawa daripada nahan air mata.",
  "Kamu itu rumah paling nyaman yang pernah aku temuin.",
];

export default function SweetWords() {
  const [index, setIndex] = useState<number | null>(null);

  function next() {
    let newIndex = Math.floor(Math.random() * SWEET_WORDS.length);
    if (SWEET_WORDS.length > 1 && newIndex === index) {
      newIndex = (newIndex + 1) % SWEET_WORDS.length;
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
              {SWEET_WORDS[index]}
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
