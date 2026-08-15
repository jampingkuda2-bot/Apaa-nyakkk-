"use client";

import { motion } from "framer-motion";
import Sky from "./Sky";
import StepJourney from "./StepJourney";
import SpinWheel from "./SpinWheel";
import Gallery from "./Gallery";
import PhotoBooth from "./PhotoBooth";
import MessageBox from "./MessageBox";
import Countdown from "./Countdown";
import TogetherCounter from "./TogetherCounter";
import SweetWords from "./SweetWords";
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
  const galleryItems = config.gallery.filter((item): item is NonNullable<typeof item> => !!item);
  const videoItems = config.videos.filter((item): item is NonNullable<typeof item> => !!item);

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
          {config.texts.heroEyebrow}
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
          whileTap={{ scale: 0.94 }}
          onClick={scrollToSteps}
          className="mt-10 rounded-full border border-white/50 bg-white/10 px-8 py-3 font-body text-sm text-white backdrop-blur transition-colors duration-200 hover:bg-white/20"
        >
          {config.texts.heroButton}
        </motion.button>
      </section>

      {/* Countdown + together counter */}
      <section className="relative flex flex-col items-center gap-14 px-6 py-14">
        <div className="flex flex-col items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">{config.texts.countdownEyebrow}</span>
          <Countdown birthdayDate={config.birthdayDate} recipientName={config.recipientName} />
        </div>

        {config.togetherSinceDate && <TogetherCounter sinceDate={config.togetherSinceDate} />}
      </section>

      {/* Steps */}
      <section id="perjalanan" className="relative py-10">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">{config.texts.stepsEyebrow}</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-white text-shadow-soft sm:text-4xl">
            {config.texts.stepsHeading}
          </h2>
        </div>
        <StepJourney steps={config.steps} />
      </section>

      {/* Gallery */}
      {galleryItems.length > 0 && (
        <section className="relative py-16">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">{config.texts.galleryEyebrow}</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-white text-shadow-soft sm:text-4xl">
              {config.texts.galleryHeading}
            </h2>
          </div>
          <div className="mt-10">
            <Gallery items={galleryItems} sounds={config.sounds} />
          </div>
        </section>
      )}

      {/* Videos */}
      {videoItems.length > 0 && (
        <section className="relative py-16">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">{config.texts.videoEyebrow}</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-white text-shadow-soft sm:text-4xl">
              {config.texts.videoHeading}
            </h2>
          </div>
          <div className="mt-10">
            <Gallery items={videoItems} sounds={config.sounds} />
          </div>
        </section>
      )}

      {/* Photo booth */}
      <section className="relative flex flex-col items-center px-6 py-16">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">{config.texts.photoboothEyebrow}</span>
        <h2 className="mt-3 max-w-sm text-center font-display text-3xl font-bold text-white text-shadow-soft sm:text-4xl">
          {config.texts.photoboothHeading}
        </h2>
        <div className="mt-10 w-full">
          <PhotoBooth sounds={config.sounds} />
        </div>
      </section>

      {/* Written reply */}
      <section className="relative flex flex-col items-center px-6 py-16">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">{config.texts.messageEyebrow}</span>
        <h2 className="mt-3 max-w-sm text-center font-display text-3xl font-bold text-white text-shadow-soft sm:text-4xl">
          {config.texts.messageHeading}
        </h2>
        <div className="mt-10 w-full">
          <MessageBox sounds={config.sounds} />
        </div>
      </section>

      {/* Sweet words */}
      <section className="relative flex flex-col items-center px-6 py-16">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">{config.texts.sweetWordsEyebrow}</span>
        <h2 className="mt-3 max-w-sm text-center font-display text-3xl font-bold text-white text-shadow-soft sm:text-4xl">
          {config.texts.sweetWordsHeading}
        </h2>
        <div className="mt-10 w-full">
          <SweetWords words={config.texts.sweetWordsList} />
        </div>
      </section>

      {/* Spin wheel */}
      <section className="relative flex flex-col items-center px-6 py-24">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">{config.texts.spinEyebrow}</span>
        <h2 className="mt-3 max-w-lg text-center font-display text-3xl font-bold text-white text-shadow-soft sm:text-4xl">
          {config.texts.spinHeading}
        </h2>
        <p className="mt-3 max-w-sm text-center text-sm text-white/75">
          {config.texts.spinSubheading}
        </p>
        <div className="mt-12">
          <SpinWheel prizes={config.prizes} sounds={config.sounds} />
        </div>
      </section>

      {/* Closing letter */}
      <section className="relative px-6 py-16">
        <div className="glass mx-auto max-w-lg rounded-3xl px-8 py-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
            {config.texts.closingLetterLabel}
          </span>
          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-white/85">
            {config.closingLetter}
          </p>
          <p className="mt-6 text-right font-script text-2xl text-white/90">{config.senderName}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 pb-[max(4rem,env(safe-area-inset-bottom))] text-center">
        <p className="font-script text-2xl text-white/90">
          Selamat ulang tahun, {config.recipientName}.
        </p>
        <p className="mt-2 font-mono text-xs text-white/50">
          dibikin sepenuh hati sama {config.senderName}
        </p>
      </footer>
    </main>
  );
}
