"use client";

import { useEffect, useState } from "react";
import InstallButton from "./InstallButton";

function getTargetDate(mmdd: string): Date {
  const [month, day] = mmdd.split("-").map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), (month || 8) - 1, day || 18, 0, 0, 0);
}

function formatDateLabel(mmdd: string): string {
  const [month, day] = mmdd.split("-").map(Number);
  const now = new Date();
  const d = new Date(now.getFullYear(), (month || 8) - 1, day || 18);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
}

export default function AccessGate({
  birthdayDate,
  hasSitePassword,
  children,
}: {
  birthdayDate: string;
  hasSitePassword: boolean;
  children: React.ReactNode;
}) {
  const [timeUp, setTimeUp] = useState<boolean | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(
    null
  );

  useEffect(() => {
    function tick() {
      const target = getTargetDate(birthdayDate);
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeUp(true);
        setTimeLeft(null);
      } else {
        setTimeUp(false);
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / (1000 * 60)) % 60),
          s: Math.floor((diff / 1000) % 60),
        });
      }
    }
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [birthdayDate]);

  useEffect(() => {
    if (timeUp && !hasSitePassword) setUnlocked(true);
  }, [timeUp, hasSitePassword]);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || checking) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/access/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Password salah.");
        setChecking(false);
        return;
      }
      setUnlocked(true);
    } catch {
      setError("Koneksinya lagi bermasalah, coba lagi ya.");
      setChecking(false);
    }
  }

  if (unlocked) return <>{children}</>;

  // avoid a flash of the lock screen before we've computed the real state
  if (timeUp === null) return <div className="fixed inset-0 bg-skynight" />;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-skynight px-6 text-center">
      <InstallButton />

      <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
        Kejutan ini masih terkunci
      </p>

      {!timeUp ? (
        <>
          <p className="mt-4 max-w-xs text-white/80">
            Website bisa diakses pada tanggal {formatDateLabel(birthdayDate)} jam 00.00.
          </p>
          {timeLeft && (
            <div className="mt-6 flex items-center justify-center gap-3">
              {[
                { label: "Hari", value: timeLeft.d },
                { label: "Jam", value: timeLeft.h },
                { label: "Menit", value: timeLeft.m },
                { label: "Detik", value: timeLeft.s },
              ].map((unit) => (
                <div key={unit.label} className="glass min-w-[64px] rounded-2xl px-3 py-3">
                  <p className="font-display text-2xl font-bold text-white">
                    {String(unit.value).padStart(2, "0")}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/60">
                    {unit.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleUnlock} className="mt-6 flex w-full max-w-xs flex-col gap-3">
          <p className="text-white/80">Sekarang udah bisa dibuka. Masukin passwordnya ya.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-white placeholder-white/50 outline-none focus:border-gold"
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={checking}
            className="rounded-full bg-gold py-3 font-semibold text-skynight disabled:opacity-60"
          >
            {checking ? "Memeriksa..." : "Buka"}
          </button>
        </form>
      )}
    </div>
  );
}
