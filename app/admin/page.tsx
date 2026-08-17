"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GALLERY_SLOTS, VIDEO_SLOTS, SiteConfig, StepData, normalizeConfig } from "@/lib/types";
import type { SpinsData } from "@/lib/spins";

import { upload } from "@vercel/blob/client";

async function uploadFile(file: File): Promise<{ url: string; type: "image" | "video" }> {
  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? 150 * 1024 * 1024 : 20 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(isVideo ? "Ukuran video maksimal 150MB." : "Ukuran foto maksimal 20MB.");
  }
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload",
  });
  return { url: blob.url, type: isVideo ? "video" : "image" };
}

async function uploadAudioFile(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Ukuran audio maksimal 10MB.");
  }
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload",
  });
  return blob.url;
}

function newStep(): StepData {
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "",
    message: "",
    photoUrl: null,
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [spinsData, setSpinsData] = useState<SpinsData | null>(null);
  const [spinsLoading, setSpinsLoading] = useState(true);
  const [resettingIp, setResettingIp] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalVisits: number;
    totalSpins: number;
    uniqueDevicesSpun: number;
    lastVisit: { time: string; device: string } | null;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  function loadConfig() {
    setLoading(true);
    setLoadError(null);
    fetch("/api/admin/config")
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw new Error(data.error || "Gagal mengambil data tersimpan.");
        }
        setConfig(normalizeConfig(data));
      })
      .catch((e) => {
        setLoadError(e instanceof Error ? e.message : "Gagal mengambil data tersimpan.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadConfig();

    loadSpinsData();

    fetch("/api/admin/summary")
      .then((r) => r.json())
      .then((data) => setSummary(data))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, []);

  function loadSpinsData() {
    setSpinsLoading(true);
    fetch("/api/admin/spins")
      .then((r) => r.json())
      .then((data) => setSpinsData(data))
      .catch(() => setSpinsData(null))
      .finally(() => setSpinsLoading(false));
  }

  async function resetSpins(key?: string) {
    setResettingIp(key ?? "__all__");
    try {
      const url = key ? `/api/admin/spins?key=${encodeURIComponent(key)}` : "/api/admin/spins";
      await fetch(url, { method: "DELETE" });
      loadSpinsData();
    } catch {
      // ignore, loadSpinsData will just show stale data
    } finally {
      setResettingIp(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-skynight text-white/70">
        Memuat panel...
      </div>
    );
  }

  if (loadError || !config) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-skynight px-6 text-center text-white">
        <p className="font-display text-lg font-semibold">Gagal memuat data</p>
        <p className="max-w-md break-words rounded-xl bg-white/10 px-4 py-3 font-mono text-xs text-white/80">
          {loadError || "Data tidak diketahui."}
        </p>
        <p className="max-w-sm text-xs text-amber-300">
          Sengaja gak ditampilin form kosong di sini, biar kamu gak nyimpen data kosong nimpa yang
          udah ada. Coba muat ulang.
        </p>
        <button
          onClick={loadConfig}
          className="mt-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-skynight"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  function update<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setConfig((c) => (c ? { ...c, [key]: value } : c));
  }

  function updateText<K extends keyof SiteConfig["texts"]>(key: K, value: SiteConfig["texts"][K]) {
    setConfig((c) => (c ? { ...c, texts: { ...c.texts, [key]: value } } : c));
  }

  function updateTextListItem(listKey: "introTeasers" | "sweetWordsList", index: number, value: string) {
    setConfig((c) => {
      if (!c) return c;
      const list = [...c.texts[listKey]];
      list[index] = value;
      return { ...c, texts: { ...c.texts, [listKey]: list } };
    });
  }

  function addTextListItem(listKey: "introTeasers" | "sweetWordsList") {
    setConfig((c) =>
      c ? { ...c, texts: { ...c.texts, [listKey]: [...c.texts[listKey], ""] } } : c
    );
  }

  function removeTextListItem(listKey: "introTeasers" | "sweetWordsList", index: number) {
    setConfig((c) => {
      if (!c) return c;
      const list = c.texts[listKey].filter((_, i) => i !== index);
      return { ...c, texts: { ...c.texts, [listKey]: list } };
    });
  }

  function updateStep(id: string, patch: Partial<StepData>) {
    setConfig((c) =>
      c ? { ...c, steps: c.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) } : c
    );
  }

  async function handleStepPhoto(id: string, file: File) {
    setBusySlot(id);
    setError(null);
    try {
      const result = await uploadFile(file);
      updateStep(id, { photoUrl: result.url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setBusySlot(null);
    }
  }

  async function handleGalleryPhoto(index: number, file: File) {
    setBusySlot(`gallery-${index}`);
    setError(null);
    try {
      const result = await uploadFile(file);
      setConfig((c) => {
        if (!c) return c;
        const gallery = [...c.gallery];
        gallery[index] = result;
        return { ...c, gallery };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setBusySlot(null);
    }
  }

  function removeGalleryPhoto(index: number) {
    setConfig((c) => {
      if (!c) return c;
      const gallery = [...c.gallery];
      gallery[index] = null;
      return { ...c, gallery };
    });
  }

  async function handleVideoFile(index: number, file: File) {
    setBusySlot(`video-${index}`);
    setError(null);
    try {
      const result = await uploadFile(file);
      setConfig((c) => {
        if (!c) return c;
        const videos = [...c.videos];
        videos[index] = result;
        return { ...c, videos };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setBusySlot(null);
    }
  }

  function removeVideo(index: number) {
    setConfig((c) => {
      if (!c) return c;
      const videos = [...c.videos];
      videos[index] = null;
      return { ...c, videos };
    });
  }

  async function handleSoundUpload(key: keyof SiteConfig["sounds"], file: File) {
    setBusySlot(`sound-${key}`);
    setError(null);
    try {
      const url = await uploadAudioFile(file);
      setConfig((c) => (c ? { ...c, sounds: { ...c.sounds, [key]: url } } : c));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setBusySlot(null);
    }
  }

  function removeSound(key: keyof SiteConfig["sounds"]) {
    setConfig((c) => (c ? { ...c, sounds: { ...c.sounds, [key]: null } } : c));
  }

  async function handleAppIconUpload(file: File) {
    setBusySlot("appIcon");
    setError(null);
    try {
      const result = await uploadFile(file);
      update("appIconUrl", result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setBusySlot(null);
    }
  }

  function removeAppIcon() {
    update("appIconUrl", null);
  }

  function addStep() {
    setConfig((c) => (c ? { ...c, steps: [...c.steps, newStep()] } : c));
  }

  function removeStep(id: string) {
    setConfig((c) => (c ? { ...c, steps: c.steps.filter((s) => s.id !== id) } : c));
  }

  function updatePrizeLabel(index: number, value: string) {
    setConfig((c) => {
      if (!c) return c;
      const prizes = [...c.prizes];
      prizes[index] = { ...prizes[index], label: value };
      return { ...c, prizes };
    });
  }

  function updatePrizeWeight(index: number, value: number) {
    setConfig((c) => {
      if (!c) return c;
      const prizes = [...c.prizes];
      prizes[index] = { ...prizes[index], weight: value };
      return { ...c, prizes };
    });
  }

  function addPrize() {
    setConfig((c) => (c ? { ...c, prizes: [...c.prizes, { label: "Hadiah baru", weight: 1 }] } : c));
  }

  function removePrize(index: number) {
    setConfig((c) => (c ? { ...c, prizes: c.prizes.filter((_, i) => i !== index) } : c));
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menyimpan");
      }
      setSavedAt(new Date().toLocaleTimeString("id-ID"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-skynight to-skydeep pb-32 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-skynight/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold">Panel Kontrol</h1>
            <p className="text-xs text-white/60">Hanya kamu yang bisa lihat halaman ini.</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <a
              href="/preview"
              target="_blank"
              className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-skynight"
            >
              Preview
            </a>
            <a
              href="/"
              target="_blank"
              className="rounded-full border border-white/20 px-4 py-2 text-xs hover:bg-white/10"
            >
              Lihat situs
            </a>
            <button
              onClick={handleLogout}
              className="rounded-full border border-white/20 px-4 py-2 text-xs hover:bg-white/10"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-10 px-6">
        {/* Basic info */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Info dasar</h2>

          <label className="mt-4 flex flex-col gap-1 text-sm">
            Judul tab browser / nama saat "Add to Home Screen"
            <input
              value={config.siteTitle}
              onChange={(e) => update("siteTitle", e.target.value)}
              className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 outline-none focus:border-gold"
            />
            <span className="text-xs text-amber-300">
              Hindari nama lengkap di sini — ini kelihatan di tab browser, riwayat, dan preview
              link sebelum dia sempat buka websitenya, jadi bisa bocorin kejutannya duluan.
            </span>
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Nama penerima
              <input
                value={config.recipientName}
                onChange={(e) => update("recipientName", e.target.value)}
                className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 outline-none focus:border-gold"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Nama kamu
              <input
                value={config.senderName}
                onChange={(e) => update("senderName", e.target.value)}
                className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 outline-none focus:border-gold"
              />
            </label>
          </div>
          <label className="mt-4 flex flex-col gap-1 text-sm">
            Pesan pembuka (di halaman depan)
            <textarea
              value={config.openingMessage}
              onChange={(e) => update("openingMessage", e.target.value)}
              rows={3}
              className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 outline-none focus:border-gold"
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Tanggal ulang tahun
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM-DD, misal 08-18"
                pattern="\d{2}-\d{2}"
                value={config.birthdayDate}
                onChange={(e) => update("birthdayDate", e.target.value)}
                className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 outline-none focus:border-gold"
              />
              <span className="text-xs text-white/50">Format MM-DD, dipakai buat hitung mundur.</span>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Tanggal jadian (opsional)
              <input
                type="date"
                value={config.togetherSinceDate ?? ""}
                onChange={(e) => update("togetherSinceDate", e.target.value || null)}
                className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 outline-none focus:border-gold"
              />
              <span className="text-xs text-white/50">
                Kosongkan kalau nggak mau nampilin penghitung "udah X hari bareng".
              </span>
            </label>
          </div>

          <label className="mt-4 flex flex-col gap-1 text-sm">
            Surat penutup (di paling bawah halaman)
            <textarea
              value={config.closingLetter}
              onChange={(e) => update("closingLetter", e.target.value)}
              rows={5}
              className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 outline-none focus:border-gold"
            />
          </label>

          <label className="mt-4 flex flex-col gap-1 text-sm">
            Password halaman utama (opsional)
            <input
              type="text"
              value={config.sitePassword ?? ""}
              onChange={(e) => update("sitePassword", e.target.value || null)}
              placeholder="Kosongkan kalau nggak perlu password"
              className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 outline-none focus:border-gold"
            />
            <span className="text-xs text-white/50">
              Website tetap terkunci pakai hitung mundur sampai tanggal ulang tahun di atas.
              Setelah waktunya tiba, kalau field ini diisi, dia harus masukin password ini dulu
              buat masuk. Kosongkan supaya otomatis kebuka begitu waktunya tiba, tanpa password.
            </span>
          </label>

          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/25 bg-white/5">
              {config.appIconUrl ? (
                <Image src={config.appIconUrl} alt="Icon" fill className="object-cover" />
              ) : (
                <Image src="/icon-192.png" alt="Icon bawaan" fill className="object-cover" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm">Icon buat "Add to Home Screen"</p>
              <p className="text-xs text-white/50">
                {config.appIconUrl ? "Pakai icon kustom" : "Pakai icon bawaan (bintang)"} — idealnya
                gambar persegi, minimal 512x512px.
              </p>
              <div className="mt-1 flex gap-2">
                <label className="cursor-pointer rounded-full border border-white/25 px-3 py-1.5 text-xs hover:bg-white/10">
                  {busySlot === "appIcon" ? "..." : config.appIconUrl ? "Ganti" : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAppIconUpload(file);
                    }}
                  />
                </label>
                {config.appIconUrl && (
                  <button
                    onClick={removeAppIcon}
                    className="rounded-full border border-white/25 px-3 py-1.5 text-xs hover:bg-white/10"
                  >
                    Pakai bawaan lagi
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Editable texts & labels */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Teks & label</h2>
          <p className="mt-1 text-xs text-white/60">
            Ganti judul-judul kecil dan teks tombol yang muncul di berbagai bagian website.
          </p>

          <div className="mt-4 flex flex-col gap-5">
            {(
              [
                { key: "heroEyebrow", label: "Label kecil di atas nama (hero)" },
                { key: "heroButton", label: "Tombol scroll di hero" },
                { key: "stepsEyebrow", label: "Label section perjalanan" },
                { key: "stepsHeading", label: "Judul section perjalanan" },
                { key: "galleryEyebrow", label: "Label section galeri" },
                { key: "galleryHeading", label: "Judul section galeri" },
                { key: "videoEyebrow", label: "Label section video" },
                { key: "videoHeading", label: "Judul section video" },
                { key: "photoboothEyebrow", label: "Label section kamera" },
                { key: "photoboothHeading", label: "Judul section kamera" },
                { key: "messageEyebrow", label: "Label section pesan" },
                { key: "messageHeading", label: "Judul section pesan" },
                { key: "sweetWordsEyebrow", label: "Label section kata manis" },
                { key: "sweetWordsHeading", label: "Judul section kata manis" },
                { key: "spinEyebrow", label: "Label section roda putar" },
                { key: "spinHeading", label: "Judul section roda putar" },
                { key: "spinSubheading", label: "Sub-judul section roda putar" },
                { key: "closingLetterLabel", label: "Label di atas surat penutup" },
              ] as const
  
