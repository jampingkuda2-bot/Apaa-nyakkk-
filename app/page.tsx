import SiteGate from "@/components/SiteGate";
import AccessGate from "@/components/AccessGate";
import { getConfig } from "@/lib/blob";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getConfig();
  // Never send the real password value down to the client — the browser
  // only needs to know whether one exists, not what it is.
  const publicConfig = { ...config, sitePassword: null };

  return (
    <AccessGate birthdayDate={config.birthdayDate} hasSitePassword={!!config.sitePassword}>
      <SiteGate config={publicConfig} />
    </AccessGate>
  );
}
