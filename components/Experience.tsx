"use client";

import { motion } from "framer-motion";
import Sky from "./Sky";
import StepJourney from "./StepJourney";
import SpinWheel from "./SpinWheel";
import Gallery from "./Gallery";
import { SiteConfig } from "@/lib/types";

function Heart({ left, delay, size }: { left: string; delay: number; size: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-0 text-blush"
      style={{ left }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: -700, opacity: [0, 0.8, 0] }}
      transition={{ duration: 9, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-7.5-4.7-10-9.3C.5 8.1 2.4 4.5 6 4.5c2 0 3.4 1 6 3.6 2.6-2.6 4-3.6 6-3.6 3.6 0 5.5 3.6 4 7.2C19.5 16.3 12 21 12 21z" />
      </svg>
    </motion.div>
  );
}

export default function Experience({ config }: { config: SiteConfig }) {
  const galleryPhotos = config.gallery.filter((p): p is string => !!p);

  const scrollToSteps = () => {
    document.getElementById("perjalanan")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Sky />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Heart left="8%" delay={0} size={18} />
        <Heart left="80%" delay={2.5} size={14} />
        <Heart left="45%" delay={5} size={22} />
        <Heart left="65%" delay={1.5} size={12} />
      </div>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-mono text-xs uppercase tracking-[0.4em] text-blush/80"
        >
          Untuk seseorang di langitku
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-4 font-script text-7xl text-white text-shadow-soft sm:text-8xl"
        >
          {config.recipientName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 max-w-md font-body text-white/85"
        >
          {config.openingMessage}
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          onClick={scrollToSteps}
          className="mt-10 rounded-full border border-white/50 bg-white/10 px-8 py-3 font-body text-sm text-white backdrop-blur transition hover:bg-white/20"
        >
          Mulai perjalanan ↓
        </motion.button>
      </section>

      {/* Steps */}
      <section id="perjalanan" className="relative py-10">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Perjalanan Kita</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-white text-shadow-soft sm:text-4xl">
            Setiap langkah, aku ingat betul
          </h2>
        </div>
        <StepJourney steps={config.steps} />
      </section>

      {/* Gallery */}
      {galleryPhotos.length > 0 && (
        <section className="relative py-16">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Galeri</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-white text-shadow-soft sm:text-4xl">
              Kepingan kenangan lainnya
            </h2>
          </div>
          <div className="mt-10">
            <Gallery photos={galleryPhotos} />
          </div>
        </section>
      )}

      {/* Spin wheel */}
      <section className="relative flex flex-col items-center px-6 py-24">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Hadiah untukmu</span>
        <h2 className="mt-3 max-w-lg text-center font-display text-3xl font-bold text-white text-shadow-soft sm:text-4xl">
          Sekarang giliranmu, putar bintangnya
        </h2>
        <p className="mt-3 max-w-sm text-center text-sm text-white/75">
          Satu putaran, satu kejutan. Semua hasilnya nyata untukmu.
        </p>
        <div className="mt-12">
          <SpinWheel prizes={config.prizes} />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 pb-[max(4rem,env(safe-area-inset-bottom))] text-center">
        <p className="font-script text-2xl text-white/90">
          Selamat ulang tahun, {config.recipientName}.
        </p>
        <p className="mt-2 font-mono text-xs text-white/50">
          dibuat dengan sepenuh hati oleh {config.senderName}
        </p>
      </footer>
    </main>
  );
}
