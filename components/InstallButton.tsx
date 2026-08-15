"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    window.addEventListener("appinstalled", handleAppInstalled);

    const standaloneNav = window.navigator as Navigator & { standalone?: boolean };
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || standaloneNav.standalone === true;
    if (standalone) setInstalled(true);

    const ua = window.navigator.userAgent;
    setIsIOS(/iphone|ipad|ipod/i.test(ua));

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
      return;
    }
    if (isIOS) setShowIOSHint(true);
  }

  if (installed) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed right-4 top-4 z-[110] flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-xs text-white backdrop-blur transition-transform active:scale-95"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Instal
      </button>

      {showIOSHint && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 px-6 pb-10"
          onClick={() => setShowIOSHint(false)}
        >
          <div
            className="glass max-w-xs rounded-3xl px-6 py-5 text-center text-sm text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <p>
              Di iPhone: tap ikon <b>Share</b> (kotak dengan panah ke atas) di browser, terus pilih{" "}
              <b>&quot;Add to Home Screen&quot;</b>.
            </p>
            <button
              onClick={() => setShowIOSHint(false)}
              className="mt-4 rounded-full bg-gold px-5 py-2 text-xs font-semibold text-skynight"
            >
              Oke
            </button>
          </div>
        </div>
      )}
    </>
  );
}
