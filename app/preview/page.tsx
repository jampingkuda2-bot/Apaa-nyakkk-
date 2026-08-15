import SiteGate from "@/components/SiteGate";
import { getConfig } from "@/lib/blob";

export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  const config = await getConfig();
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
