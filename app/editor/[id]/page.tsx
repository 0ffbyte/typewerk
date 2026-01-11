import Editor from "@/components/editor/_main";
import { getSite } from "@/db/queries";
import { notFound } from "next/navigation";
import { sanitizeSiteObject } from "@/lib/sanitize";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { siteObject } = await getSite(id);
  if (!siteObject) return notFound();

  const sanitizedSite = sanitizeSiteObject(siteObject);
  return (
    <div className="flex flex-col min-h-screen items-start justify-start md:w-[800px] pt-[44] md:pt-[64] pb-[24] px-[12] md:px-[64px] mx-auto font-sans">
      <Editor initialState={sanitizedSite} siteId={id} />
    </div>
  );
}
