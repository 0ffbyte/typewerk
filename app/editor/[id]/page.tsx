import Editor from "@/components/editor/_main";
import { getSite } from "@/db/queries";
import { notFound } from "next/navigation";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { siteObject } = await getSite(id);

  if (!siteObject) return notFound();
  return (
    <div className="flex flex-col min-h-screen items-start justify-start md:w-[800px] pt-[92] pb-[24] px-[12] md:px-[64px] mx-auto font-sans">
      <Editor initialState={siteObject} />
    </div>
  );
}
