import Editor from "@/components/editor/_main";
import Toolbar from "@/components/editor/toolbar";
import { getSite } from "@/db/queries";
import { notFound } from "next/navigation";
import { sanitizeSiteObject } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const site = await getSite(subdomain);
  if (!site) return notFound();

  const { siteObject, id } = site;
  const sanitizedSite = sanitizeSiteObject(siteObject);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] min-h-screen w-full items-start justify-start mx-auto font-sans px-4 scroll-smooth md:px-[64px]">
      <div className="hidden lg:block w-full h-full border-green-500 mt-[64]"></div>
      <Editor initialState={sanitizedSite} siteId={id} />
      <Toolbar siteId={id} subdomain={subdomain} />
    </div>
  );
}
