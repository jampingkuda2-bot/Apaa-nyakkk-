import SiteGate from "@/components/SiteGate";
import { getConfig } from "@/lib/blob";

export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  let config;
  try {
    config = await getConfig();
  } catch (err) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-skynight px-6 text-center text-white">
        <p className="font-display text-lg font-semibold">Gagal memuat data buat preview</p>
        <p className="max-w-md break-words rounded-xl bg-white/10 px-4 py-3 font-mono text-xs text-white/80">
          {err instanceof Error ? err.message : "Error tidak diketahui"}
        </p>
        <p className="text-xs text-white/50">Coba refresh halaman ini sebentar lagi.</p>
      </div>
    );
  }

  const publicConfig = { ...config, sitePassword: null };

  return (
    <div className="relative">
      <div className="fixed left-1/2 top-3 z-[200] -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-white backdrop-blur">
        Mode preview — gerbang waktu & password dilewati
      </div>
      <SiteGate config={publicConfig} />
    </div>
  );
}
