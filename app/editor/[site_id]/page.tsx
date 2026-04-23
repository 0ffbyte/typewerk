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

  const siteObject = {
    header: site.header,
    pages: site.pages,
    theme: site.theme,
  };
  const sanitizedSite = sanitizeSiteObject(siteObject);
  return (
    <div className="flex min-h-screen w-fit mx-auto">
      <TOC />
      <EditorShell initialState={sanitizedSite} siteId={site.id} />
      <Toolbar siteId={site.id} />
    </div>
  );
}
