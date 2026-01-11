import Renderer from "@/components/renderer/_main";
import { getSiteByDomain } from "@/db/queries";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export const revalidate = false;

export default async function Page({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const site = await getSiteByDomain(domain);

  if (!site) return notFound();
  return (
    <div className="flex flex-col min-h-screen items-start justify-start md:w-[800px] pt-[44] md:pt-[64] pb-[24] px-[12] md:px-[64px] mx-auto font-sans">
      <Renderer siteObject={site.siteObject} />
    </div>
  );
}
