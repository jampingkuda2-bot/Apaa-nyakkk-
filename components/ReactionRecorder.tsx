"use client";

import { useEffect, useRef, useState } from "react";

const RECORD_SECONDS = 9;

type Status = "starting" | "recording" | "sending" | "done" | "error";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// This component only ever forwards the recorded clip to /api/reaction/send
// and never writes it anywhere else (no Blob storage, no disk, no database).
export default function ReactionRecorder() {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(RECORD_SECONDS);
  const [status, setStatus] = useState<Status>("starting");

  useEffect(() => {
    let cancelled = false;
    let interval: number | undefined;

    async function handleStop() {
      setStatus("sending");
      try {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const base64 = await blobToBase64(blob);
        const res = await fetch("/api/reaction/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoBase64: base64 }),
        });
        if (!res.ok) throw new Error("send failed");
        setStatus("done");
      } catch {
        setStatus("error");
      }
    }

    function stopRecording() {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    }

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 480, height: 360 },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const candidates = ["video/webm;codecs=vp8,opus", "video/webm"];
        const mimeType = candidates.find(
          (t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)
        );

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 250_000,
          audioBitsPerSecond: 48_000,
        });
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = handleStop;

        recorder.start();
        setStatus("recording");

        interval = window.setInterval(() => {
          setSecondsLeft((s) => {
            if (s <= 1) {
              if (interval) window.clearInterval(interval);
              stopRecording();
              return 0;
            }
            return s - 1;
          });
        }, 1000);
      } catch {
        setStatus("error");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function manualStop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  if (status === "done" || status === "error") return null;

  return (
    <div className="fixed right-4 top-4 z-[70] flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur">
      {status === "starting" && <span className="text-xs text-white/80">Nyalain kamera...</span>}
      {status === "recording" && (
        <>
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="font-mono text-xs text-white">REC {secondsLeft}s</span>
          <button onClick={manualStop} className="ml-1 text-xs text-white/70 underline">
            Stop
          </button>
        </>
      )}
      {status === "sending" && <span className="text-xs text-white/80">Ngirim video...</span>}
    </div>
  );
}
