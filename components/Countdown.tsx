"use client";

import { useEffect, useState } from "react";

function getNextOccurrence(mmdd: string): Date {
  const [month, day] = mmdd.split("-").map(Number);
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), (month || 8) - 1, day || 18, 0, 0, 0);
  if (thisYear.toDateString() === now.toDateString()) return thisYear;
  if (thisYear.getTime() < now.getTime()) {
    return new Date(now.getFullYear() + 1, (month || 8) - 1, day || 18);
  }
  return thisYear;
}

function isTargetDay(mmdd: string): boolean {
  const [month, day] = mmdd.split("-").map(Number);
  const now = new Date();
  return now.getMonth() + 1 === month && now.getDate() === day;
}

export default function Countdown({
  birthdayDate,
  recipientName,
}: {
  birthdayDate: string;
  recipientName: string;
}) {
  const [today, setToday] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(
    null
  );

  useEffect(() => {
    function tick() {
      if (isTargetDay(birthdayDate)) {
        setToday(true);
        setTimeLeft(null);
        return;
      }
      setToday(false);
      const target = getNextOccurrence(birthdayDate);
      const diff = Math.max(0, target.getTime() - Date.now());
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [birthdayDate]);

  if (today) {
    return (
      <p className="text-center font-display text-2xl font-bold text-gold">
        Hari ini harinya {recipientName}! 🎉
      </p>
    );
  }

  if (!timeLeft) return null;

  const units = [
    { label: "Hari", value: timeLeft.d },
    { label: "Jam", value: timeLeft.h },
    { label: "Menit", value: timeLeft.m },
    { label: "Detik", value: timeLeft.s },
  ];

  return (
    <div className="flex items-center justify-center gap-3">
      {units.map((unit) => (
        <div key={unit.label} className="glass min-w-[64px] rounded-2xl px-3 py-3 text-center">
          <p className="font-display text-2xl font-bold text-white">
            {String(unit.value).padStart(2, "0")}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/60">{unit.label}</p>
        </div>
      ))}
    </div>
  );
}
