"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DEFAULT_CONFIG, GALLERY_SLOTS, SiteConfig, StepData } from "@/lib/types";

import { upload } from "@vercel/blob/client";

async function uploadFile(file: File): Promise<string> {
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("Ukuran foto maksimal 20MB.");
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
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busySlot, setBusySlot] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((data) => setConfig({ ...DEFAULT_CONFIG, ...data }))
      .catch(() => setConfig(DEFAULT_CONFIG))
      .finally(() => setLoading(false));
  }, []);

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
      const url = await uploadFile(file);
      updateStep(id, { photoUrl: url });
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
      const url = await uploadFile(file);
      setConfig((c) => {
        if (!c) return c;
        const gallery = [...c.gallery];
        gallery[index] = url;
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

  function addStep() {
    setConfig((c) => (c ? { ...c, steps: [...c.steps, newStep()] } : c));
  }

  function removeStep(id: string) {
    setConfig((c) => (c ? { ...c, steps: c.steps.filter((s) => s.id !== id) } : c));
  }

  function updatePrize(index: number, value: string) {
    setConfig((c) => {
      if (!c) return c;
      const prizes = [...c.prizes];
      prizes[index] = value;
      return { ...c, prizes };
    });
  }

  function addPrize() {
    setConfig((c) => (c ? { ...c, prizes: [...c.prizes, "Hadiah baru"] } : c));
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

        {/* Gallery */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">Galeri foto ({GALLERY_SLOTS} slot)</h2>
          <p className="mt-1 text-xs text-white/60">
            Slot kosong tidak akan muncul di website. Isi sesuka hati, 6–10 foto juga bisa.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {config.gallery.map((url, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-white/20 bg-white/5">
                  {url ? (
                    <Image src={url} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-white/40">
                      Slot {i + 1}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <label className="cursor-pointer rounded-full border border-white/25 px-2 py-1 text-[10px] hover:bg-white/10">
                    {busySlot === `gallery-${i}` ? "..." : url ? "Ganti" : "Isi"}
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
                  {url && (
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
          <div className="mt-4 flex flex-col gap-2">
            {config.prizes.map((prize, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={prize}
                  onChange={(e) => updatePrize(i, e.target.value)}
                  className="w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm outline-none focus:border-gold"
                />
                <button
                  onClick={() => removePrize(i)}
                  className="shrink-0 text-xs text-red-300 hover:text-red-200"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
          {config.prizes.length < 2 && (
            <p className="mt-2 text-xs text-amber-300">Minimal isi 2 hadiah supaya roda bisa berputar.</p>
          )}
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
