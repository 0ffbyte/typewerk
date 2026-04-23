import Renderer from "@/components/renderer/_main";
import { getSiteCached } from "@/db/queries";
import { sanitizeSiteObject } from "@/lib/sanitize";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

export default async function Page({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const site = await getSiteCached(subdomain);
  if (!site) return notFound();

  const siteObject = {
    header: site.header,
    pages: site.pages,
    theme: site.theme,
  };

  const sanitizedSite = sanitizeSiteObject(siteObject);
  return (
    <div className="flex flex-col min-h-screen items-start justify-start md:w-[800px] pt-[44] md:pt-[92] pb-[24] px-[12] md:px-0 mx-auto font-sans">
      <Renderer siteObject={sanitizedSite} />
    </div>
  );
}
