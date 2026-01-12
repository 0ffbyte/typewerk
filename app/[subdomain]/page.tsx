import Renderer from "@/components/renderer/_main";
import { getSiteBySubdomain } from "@/db/queries";
import { sanitizeSiteObject } from "@/lib/sanitize";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export const revalidate = 3600; // revalidate at most once per hour

export default async function Page({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const site = await getSiteBySubdomain(subdomain);
  if (!site) return notFound();

  const sanitizedSite = sanitizeSiteObject(site.siteObject);

  return (
    <div className="flex flex-col min-h-screen items-start justify-start md:w-[800px] pt-[44] md:pt-[64] pb-[24] px-[12] md:px-[64px] mx-auto font-sans">
      <Renderer siteObject={sanitizedSite} />
    </div>
  );
}
