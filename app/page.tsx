import Experience from "@/components/Experience";
import { getConfig } from "@/lib/blob";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getConfig();
  return <Experience config={config} />;
}
