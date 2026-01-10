import Renderer from "@/components/renderer/_main";
import { getSiteByDomain } from "@/db/queries";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  return (
    <div className="flex flex-col min-h-screen items-start justify-start md:w-[800px] pt-[44] md:pt-[64] pb-[24] px-[12] md:px-[64px] mx-auto font-sans">
      <Suspense fallback={<div>...</div>}>
        <RendererPage params={params} />
      </Suspense>
    </div>
  );
}

const RendererPage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
}) => {
  const { domain } = await params;
  const site = await getSiteByDomain(domain);

  if (!site) return notFound();

  return <Renderer siteObject={site.siteObject} />;
};
