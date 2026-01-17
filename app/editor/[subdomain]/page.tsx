import Editor from "@/components/editor/_main";
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
  const { siteObject, id } = await getSite(subdomain);
  if (!siteObject) return notFound();

  const sanitizedSite = sanitizeSiteObject(siteObject);
  return (
    <div className="flex flex-col min-h-screen items-start justify-start md:w-[800px] pt-[44] md:pt-[92] pb-[24] px-[12] mx-auto font-sans">
      <Editor initialState={sanitizedSite} siteId={id} />
    </div>
  );
}
