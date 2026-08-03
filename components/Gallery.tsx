"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MediaItem } from "@/lib/types";

export default function Gallery({ items }: { items: MediaItem[] }) {
  const [active, setActive] = useState<MediaItem | null>(null);

  if (items.length === 0) return null;

  return (
    <div className="mx-auto max-w-4xl px-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item, i) => (
          <motion.button
            key={item.url}
            onClick={() => setActive(item)}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: (i % 6) * 0.06 }}
            className="relative aspect-square overflow-hidden rounded-2xl border-2 border-white/60 shadow-lg transition hover:scale-[1.03] focus-visible:scale-[1.03]"
          >
            {item.type === "video" ? (
              <video
                src={item.url}
                className="h-full w-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <Image
                src={item.url}
                alt="Kenangan"
                fill
                sizes="(max-width: 640px) 45vw, 240px"
                className="object-cover"
              />
            )}
            {item.type === "video" && (
              <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
                ▶ video
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-skynight/90 p-6"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-3xl border-4 border-white/70"
            >
              {active.type === "video" ? (
                <video
                  src={active.url}
                  className="max-h-[80vh] w-full bg-skynight object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <Image
                  src={active.url}
                  alt="Kenangan"
                  width={800}
                  height={1000}
                  className="h-full w-full object-contain bg-skynight"
                />
              )}
            </motion.div>
            <button
              onClick={() => setActive(null)}
              className="absolute right-6 top-6 rounded-full bg-white/20 px-4 py-2 font-body text-sm text-white backdrop-blur"
              aria-label="Tutup"
            >
              Tutup ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
