"use client";

export default function TogetherCounter({ sinceDate }: { sinceDate: string }) {
  const start = new Date(sinceDate);
  if (isNaN(start.getTime())) return null;

  const days = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return null;

  const formatted = start.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Sejak {formatted}</p>
      <p className="mt-2 font-display text-4xl font-bold text-white text-shadow-soft sm:text-5xl">
        {days.toLocaleString("id-ID")} hari
      </p>
      <p className="mt-1 text-sm text-white/70">kita udah bareng-bareng</p>
    </div>
  );
}
