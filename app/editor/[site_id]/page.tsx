import Toolbar from "@/components/editor/toolbar";
import { getSite } from "@/db/queries";
import { notFound } from "next/navigation";
import { sanitizeSiteObject } from "@/lib/sanitize";
import TOC from "@/components/editor/toc";
import EditorShell from "@/components/editor/editor-shell";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ site_id: string }>;
}) {
  const { site_id } = await params;
  const site = await getSite(site_id);
  if (!site) return notFound();

  const { siteObject, id } = site;
  const sanitizedSite = sanitizeSiteObject(siteObject);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] min-h-screen w-full items-start justify-start font-sans px-2 scroll-smooth md:px-[64px] py-[64] md:py-[96]">
      <div className="hidden lg:block w-full h-full border-green-500">
        <TOC />
      </div>
      <EditorShell initialState={sanitizedSite} siteId={id} />
      <Toolbar siteId={id} />
    </div>
  );
}
