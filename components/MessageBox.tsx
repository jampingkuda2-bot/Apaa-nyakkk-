"use client";

import { useRef, useState } from "react";
import { createAudioContext, scheduleWinJingle } from "@/lib/sound";
import { playCustomSound } from "@/lib/customAudio";
import { vibrate } from "@/lib/haptics";
import { SoundPack } from "@/lib/types";

type Status = "idle" | "sending" | "sent" | "error";

export default function MessageBox({ sounds }: { sounds?: SoundPack }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  async function handleSend() {
    if (!text.trim() || status === "sending") return;
    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/message/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal mengirim pesan.");
      setStatus("sent");
      setText("");

      if (sounds?.winJingle) {
        playCustomSound(sounds.winJingle);
      } else {
        if (!audioCtxRef.current) audioCtxRef.current = createAudioContext();
        const ctx = audioCtxRef.current;
        if (ctx) {
          ctx.resume();
          scheduleWinJingle(ctx, 0);
        }
      }
      vibrate([25, 40, 25, 40, 70]);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Gagal mengirim pesan.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
        <p className="font-display text-lg text-gold">Kekirim! 💌</p>
        <button
          onClick={() => setStatus("idle")}
          className="text-xs text-white/60 underline"
        >
          Tulis satu lagi
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
      <div className="glass w-full rounded-3xl p-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis aja apa yang mau kamu bilang..."
          rows={4}
          maxLength={2000}
          className="w-full resize-none rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={status === "sending" || !text.trim()}
        className="rounded-full bg-gold px-8 py-3 font-display font-semibold text-skynight transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Ngirim..." : "Kirim pesan ✉️"}
      </button>

      {status === "error" && <p className="text-sm text-red-300">{errorMsg}</p>}
    </div>
  );
}
