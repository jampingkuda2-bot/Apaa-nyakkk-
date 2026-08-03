"use client";

import { useEffect, useRef, useState } from "react";

type Stage = "idle" | "camera" | "preview" | "sending" | "sent" | "error";

export default function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [photo, setPhoto] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startCamera() {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setStage("camera");
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      fileInputRef.current?.click();
    }
  }

  function resizeToBase64(source: CanvasImageSource, sourceW: number, sourceH: number): string {
    const maxW = 1000;
    const scale = Math.min(1, maxW / sourceW);
    const w = Math.round(sourceW * scale) || 1;
    const h = Math.round(sourceH * scale) || 1;
    const canvas = canvasRef.current;
    if (!canvas) return "";
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(source, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.82);
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const dataUrl = resizeToBase64(video, video.videoWidth, video.videoHeight);
    setPhoto(dataUrl);
    stopCamera();
    setStage("preview");
  }

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    img.onload = () => {
      const dataUrl = resizeToBase64(img, img.naturalWidth, img.naturalHeight);
      setPhoto(dataUrl);
      setStage("preview");
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  }

  function retake() {
    setPhoto(null);
    setErrorMsg(null);
    setStage("idle");
  }

  async function sendPhoto() {
    if (!photo) return;
    setStage("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/photobooth/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: photo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal mengirim foto.");
      setStage("sent");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Gagal mengirim foto.");
      setStage("error");
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-5">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] border-4 border-gold/80 bg-skynight/60 shadow-[0_0_50px_rgba(246,196,83,0.25)]">
        {stage === "camera" && (
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
        )}

        {photo && stage !== "camera" && stage !== "idle" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Fotomu" className="h-full w-full object-cover" />
        )}

        {stage === "idle" && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
            <span className="text-4xl">📸</span>
            <p className="text-sm text-white/70">Ambil satu foto buatku, sekarang sayanggg.</p>
          </div>
        )}

        <span className="absolute left-3 top-3 text-lg text-gold/80">✦</span>
        <span className="absolute right-3 top-3 text-lg text-gold/80">✦</span>
        <span className="absolute bottom-3 left-3 text-lg text-gold/80">✦</span>
        <span className="absolute bottom-3 right-3 text-lg text-gold/80">✦</span>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFilePicked}
      />

      {stage === "idle" && (
        <button
          onClick={startCamera}
          className="rounded-full bg-gold px-8 py-3 font-display font-semibold text-skynight transition-transform active:scale-95"
        >
          Buka kamera 📷
        </button>
      )}

      {stage === "camera" && (
        <button
          onClick={capturePhoto}
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 transition-transform active:scale-90"
          aria-label="Jepret"
        >
          <span className="h-11 w-11 rounded-full bg-white" />
        </button>
      )}

      {stage === "preview" && (
        <div className="flex gap-3">
          <button
            onClick={retake}
            className="rounded-full border border-white/40 px-6 py-2.5 text-sm text-white transition-transform active:scale-95"
          >
            Ambil ulang
          </button>
          <button
            onClick={sendPhoto}
            className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-skynight transition-transform active:scale-95"
          >
            Kirim ✉️
          </button>
        </div>
      )}

      {stage === "sending" && <p className="text-sm text-white/70">Lagi ngirim...</p>}

      {stage === "sent" && (
        <div className="text-center">
          <p className="font-display text-lg text-gold">Terkirim! 💌</p>
          <button onClick={retake} className="mt-2 text-xs text-white/60 underline">
            Kirim satu lagi
          </button>
        </div>
      )}

      {stage === "error" && (
        <div className="text-center">
          <p className="text-sm text-red-300">{errorMsg}</p>
          <button onClick={retake} className="mt-2 text-xs text-white/60 underline">
            Coba lagi
          </button>
        </div>
      )}
    </div>
  );
}
