"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DEFAULT_CONFIG, GALLERY_SLOTS, VIDEO_SLOTS, SiteConfig, StepData, normalizeConfig } from "@/lib/types";
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
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [spinsData, setSpinsData] = useState<SpinsData | null>(null);
  const [spinsLoading, setSpinsLoading] = useState(true);
  const [resettingIp, setResettingIp] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((data) => setConfig(normalizeConfig(data)))
      .catch(() => setConfig(DEFAULT_CONFIG))
      .finally(() => setLoading(false));

    loadSpinsData();
  }, []);

  function loadSpinsData() {
    setSpinsLoading(true);
    fetch("/api/admin/spins")
      .then((r) => r.json())
      .then((data) => setSpinsData(data))
      .catch(() => setSpinsData(null))
      .finally(() => setSpinsLoading(false));
  }

  async function resetSpins(ip?: string) {
    setResettingIp(ip ?? "__all__");
    try {
      const url = ip ? `/api/admin/spins?ip=${encodeURIComponent(ip)}` : "/api/admin/spins";
      await fetch(url, { method: "DELETE" });
      loadSpinsData();
    } catch {
      // ignore, loadSpinsData will just show stale data
    } finally {
      setResettingIp(null);
    }
  }

  if (loading || !config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-skynight text-white/70">
        Memuat panel...
      </div>
    );
  }

  function update<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setConfig((c) => (c ? { ...c, [key]: value } : c));
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
          <div className="flex items-center gap-3">
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
        </section>

        {/* Steps */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Langkah perjalanan</h2>
            <button
              onClick={addStep}
              className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-skynight"
            >
              + Tambah langkah
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-6">
            {config.steps.map((step, i) => (
              <div key={step.id} className="rounded-xl border border-white/15 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gold">Langkah {i + 1}</span>
                  <button
                    onClick={() => removeStep(step.id)}
                    className="text-xs text-red-300 hover:text-red-200"
                  >
                    Hapus
                  </button>
                </div>

                <input
                  value={step.title}
                  onChange={(e) => updateStep(step.id, { title: e.target.value })}
                  placeholder="Judul langkah"
                  className="mt-3 w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <textarea
                  value={step.message}
                  onChange={(e) => updateStep(step.id, { message: e.target.value })}
                  placeholder="Pesan untuk langkah ini"
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm outline-none focus:border-gold"
                />

                <div className="mt-3 flex items-center gap-4">
                  {step.photoUrl ? (
                    <div className="relative h-20 w-16 overflow-hidden rounded-lg border border-white/30">
                      <Image src={step.photoUrl} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-20 w-16 items-center justify-center rounded-lg border border-dashed border-white/30 text-[10px] text-white/50">
                      Kosong
                    </div>
                  )}
                  <label className="cursor-pointer rounded-full border border-white/25 px-3 py-1.5 text-xs hover:bg-white/10">
                    {busySlot === step.id ? "Mengunggah..." : "Ganti foto"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleStepPhoto(step.id, file);
                      }}
                    />
                  </label>
                  {step.photoUrl && (
                    <button
                      onClick={() => updateStep(step.id, { photoUrl: null })}
                      className="text-xs text-white/50 hover:text-white"
                    >
                      Hapus foto
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery (photos only) */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Galeri foto ({GALLERY_SLOTS} slot)</h2>
          <p className="mt-1 text-xs text-white/60">
            Slot kosong tidak akan muncul di website. Isi sesuka hati, 6–10 foto juga bisa.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {config.gallery.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-white/20 bg-white/5">
                  {item ? (
                    <Image src={item.url} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-white/40">
                      Slot {i + 1}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <label className="cursor-pointer rounded-full border border-white/25 px-2 py-1 text-[10px] hover:bg-white/10">
                    {busySlot === `gallery-${i}` ? "..." : item ? "Ganti" : "Isi"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleGalleryPhoto(i, file);
                      }}
                    />
                  </label>
                  {item && (
                    <button
                      onClick={() => removeGalleryPhoto(i)}
                      className="rounded-full border border-white/25 px-2 py-1 text-[10px] hover:bg-white/10"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Videos (separate from photo gallery) */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Video kenangan ({VIDEO_SLOTS} slot)</h2>
          <p className="mt-1 text-xs text-white/60">
            Khusus video (mp4/mov), auto-play tanpa suara di website. Maks 150MB per video.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {config.videos.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-white/20 bg-white/5">
                  {item ? (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-white/40">
                      Video {i + 1}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <label className="cursor-pointer rounded-full border border-white/25 px-2 py-1 text-[10px] hover:bg-white/10">
                    {busySlot === `video-${i}` ? "..." : item ? "Ganti" : "Isi"}
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVideoFile(i, file);
                      }}
                    />
                  </label>
                  {item && (
                    <button
                      onClick={() => removeVideo(i)}
                      className="rounded-full border border-white/25 px-2 py-1 text-[10px] hover:bg-white/10"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prizes */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Hadiah roda putar</h2>
            <button
              onClick={addPrize}
              className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-skynight"
            >
              + Tambah hadiah
            </button>
          </div>
          <p className="mt-1 text-xs text-white/60">
            Angka "rate" itu bobot peluang, bukan persen langsung — makin gede angkanya dibanding
            hadiah lain, makin sering dia keluar. Semua rate sama = peluangnya rata.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {config.prizes.map((prize, i) => {
              const totalWeight = config.prizes.reduce((sum, p) => sum + Math.max(0, p.weight), 0);
              const pct = totalWeight > 0 ? Math.round((Math.max(0, prize.weight) / totalWeight) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={prize.label}
                    onChange={(e) => updatePrizeLabel(i, e.target.value)}
                    className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={prize.weight}
                    onChange={(e) => updatePrizeWeight(i, Math.max(0, Number(e.target.value) || 0))}
                    className="w-16 shrink-0 rounded-lg border border-white/25 bg-white/10 px-2 py-2 text-center text-sm outline-none focus:border-gold"
                    aria-label="Rate"
                  />
                  <span className="w-10 shrink-0 text-right text-[11px] text-white/50">{pct}%</span>
                  <button
                    onClick={() => removePrize(i)}
                    className="shrink-0 text-xs text-red-300 hover:text-red-200"
                  >
                    Hapus
                  </button>
                </div>
              );
            })}
          </div>
          {config.prizes.length < 2 && (
            <p className="mt-2 text-xs text-amber-300">Minimal isi 2 hadiah supaya roda bisa berputar.</p>
          )}

          <div className="mt-5 border-t border-white/10 pt-4">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>
                Batas maksimal putaran
                <span className="block text-xs text-white/50">per alamat IP / jaringan</span>
              </span>
              <input
                type="number"
                min={1}
                value={config.maxSpinsPerIp}
                onChange={(e) =>
                  update("maxSpinsPerIp", Math.max(1, Number(e.target.value) || 1))
                }
                className="w-20 rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-center text-sm outline-none focus:border-gold"
              />
            </label>
          </div>
        </section>

        {/* Spin data management */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Kelola data spin</h2>
            <button
              onClick={() => resetSpins()}
              disabled={resettingIp !== null}
              className="rounded-full border border-red-300/50 px-4 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-300/10 disabled:opacity-50"
            >
              {resettingIp === "__all__" ? "Mereset..." : "Reset semua"}
            </button>
          </div>
          <p className="mt-1 text-xs text-white/60">
            Ini daftar alamat IP yang sudah pernah mutar roda, beserta sisa jatahnya. Reset kalau
            mau kasih dia jatah putaran baru.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {spinsLoading && <p className="text-sm text-white/50">Memuat...</p>}

            {!spinsLoading && spinsData && Object.keys(spinsData.byIp).length === 0 && (
              <p className="text-sm text-white/50">Belum ada yang pernah mutar roda.</p>
            )}

            {!spinsLoading &&
              spinsData &&
              Object.entries(spinsData.byIp).map(([ip, entry]) => {
                const last = entry.history[entry.history.length - 1];
                return (
                  <div
                    key={ip}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-white/80">{ip}</p>
                      <p className="mt-0.5 text-xs text-white/50">
                        {entry.count} kali dipakai
                        {last ? ` · terakhir: ${last.prize} (${last.time})` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => resetSpins(ip)}
                      disabled={resettingIp !== null}
                      className="shrink-0 rounded-full border border-white/25 px-3 py-1.5 text-xs hover:bg-white/10 disabled:opacity-50"
                    >
                      {resettingIp === ip ? "..." : "Reset"}
                    </button>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-skynight/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="text-xs text-white/60">
            {error ? (
              <span className="text-red-300">{error}</span>
            ) : savedAt ? (
              `Tersimpan pukul ${savedAt}`
            ) : (
              "Perubahan belum disimpan"
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-gold px-8 py-2.5 font-semibold text-skynight disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
