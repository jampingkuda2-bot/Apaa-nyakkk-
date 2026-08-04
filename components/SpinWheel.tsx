"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { createAudioContext, scheduleWheelTicks, scheduleWinJingle } from "@/lib/sound";
import { vibrate } from "@/lib/haptics";

const PALETTE = ["#A7E0FB", "#F6C453", "#FFD6E0", "#5FB2E8", "#2E74B5"];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export default function SpinWheel({ prizes }: { prizes: string[] }) {
  const n = prizes.length;
  const segmentAngle = 360 / n;
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const rotationRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const SPIN_DURATION = 4.2;

  const size = 320;
  const radius = size / 2;

  const segments = useMemo(
    () =>
      prizes.map((label, i) => {
        const startAngle = i * segmentAngle;
        const endAngle = (i + 1) * segmentAngle;
        const mid = startAngle + segmentAngle / 2;
        return {
          label,
          path: arcPath(radius, radius, radius - 4, startAngle, endAngle),
          color: PALETTE[i % PALETTE.length],
          mid,
        };
      }),
    [prizes, segmentAngle, radius]
  );

  function handleSpin() {
    if (spinning || n === 0) return;
    setSpinning(true);
    setResult(null);

    const winnerIndex = Math.floor(Math.random() * n);
    const target = (360 - (winnerIndex * segmentAngle + segmentAngle / 2) + 360) % 360;
    const current = rotationRef.current % 360;
    const forwardDelta = ((target - current) % 360 + 360) % 360;
    const extraSpins = 6;
    const newRotation = rotationRef.current + extraSpins * 360 + forwardDelta;

    rotationRef.current = newRotation;
    setRotation(newRotation);

    if (!audioCtxRef.current) audioCtxRef.current = createAudioContext();
    const ctx = audioCtxRef.current;
    if (ctx) {
      ctx.resume();
      scheduleWheelTicks(ctx, 0, SPIN_DURATION);
      scheduleWinJingle(ctx, SPIN_DURATION);
    }
    vibrate(12);

    window.setTimeout(() => {
      setSpinning(false);
      setResult(prizes[winnerIndex]);
      setHistory((h) => [prizes[winnerIndex], ...h].slice(0, 5));
      vibrate([30, 50, 90]);
    }, SPIN_DURATION * 1000);
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative" style={{ width: size, height: size }}>
        {/* pointer */}
        <div className="absolute left-1/2 -top-3 z-20 -translate-x-1/2">
          <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
            <path d="M14 34L0 6C0 2.68629 2.68629 0 6 0H22C25.3137 0 28 2.68629 28 6L14 34Z" fill="#F6C453" />
          </svg>
        </div>

        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4.2, ease: [0.12, 0.67, 0.1, 1] }}
          style={{ width: size, height: size }}
          className="rounded-full shadow-[0_0_60px_rgba(246,196,83,0.35)] ring-4 ring-white/70"
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map((seg, i) => (
              <path key={i} d={seg.path} fill={seg.color} stroke="#ffffff" strokeWidth="2" />
            ))}
            {segments.map((seg, i) => {
              const labelR = radius * 0.62;
              const pos = polarToCartesian(radius, radius, labelR, seg.mid);
              return (
                <text
                  key={i}
                  x={pos.x}
                  y={pos.y}
                  fill="#123A5E"
                  fontSize="12.5"
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${seg.mid}, ${pos.x}, ${pos.y})`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {seg.label}
                </text>
              );
            })}
            <circle cx={radius} cy={radius} r={radius * 0.16} fill="#123A5E" stroke="#F6C453" strokeWidth="3" />
          </svg>
        </motion.div>
      </div>

      <button
        onClick={handleSpin}
        disabled={spinning || n === 0}
        className="rounded-full bg-gold px-10 py-3.5 font-display text-lg font-semibold text-skynight shadow-lg transition hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {spinning ? "Berputar..." : "Putar sekarang"}
      </button>

      {result && !spinning && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass rounded-2xl px-8 py-5 text-center"
        >
          <p className="font-body text-sm uppercase tracking-widest text-blush/90">Kamu dapat</p>
          <p className="font-display text-3xl font-bold text-white text-shadow-soft">{result}</p>
        </motion.div>
      )}

      {history.length > 1 && (
        <div className="text-center text-xs text-white/60 font-mono">
          Riwayat: {history.slice(1).join(" · ")}
        </div>
      )}
    </div>
  );
}
