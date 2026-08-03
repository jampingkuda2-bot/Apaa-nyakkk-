import SiteGate from "@/components/SiteGate";
import { getConfig } from "@/lib/blob";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getConfig();
  return <SiteGate config={config} />;
}
