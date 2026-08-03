"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { StepData } from "@/lib/types";

function StepCard({ step, index }: { step: StepData; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative flex flex-col items-center gap-6 md:flex-row ${
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      <div className="relative w-full max-w-sm shrink-0">
        <div className="animate-floaty rounded-[2rem] border-4 border-white/80 bg-white/10 p-2 shadow-2xl">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-skymid to-skyhigh">
            {step.photoUrl ? (
              <Image
                src={step.photoUrl}
                alt={step.title}
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-script text-3xl text-white/70">Angel</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass w-full max-w-md rounded-3xl px-8 py-7 text-center md:text-left">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
          Langkah {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="mt-2 font-display text-2xl font-bold text-white text-shadow-soft">
          {step.title}
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-white/85">{step.message}</p>
      </div>
    </motion.div>
  );
}

export default function StepJourney({ steps }: { steps: StepData[] }) {
  return (
    <div className="relative mx-auto flex max-w-3xl flex-col gap-20 px-6 py-10 md:gap-28">
      {steps.map((step, i) => (
        <StepCard key={step.id} step={step} index={i} />
      ))}
    </div>
  );
}
