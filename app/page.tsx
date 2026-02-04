import UserSites from "@/components/user-sites";
import { Suspense } from "react";
import NewSite from "@/components/new-site";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen items-start justify-start md:w-[800px] pt-[44] md:pt-[64] pb-[24] px-[12] md:px-[64px] mx-auto font-sans">
      <h1 className="text-[32px] font-semibold">typewerk 0.2</h1>
      <NewSite />
      <div className="h-[64px]" />

      <h3 className="font-semibold mb-[24px]">My Sites</h3>

      <Suspense fallback={<div>Loading...</div>}>
        <UserSites />
      </Suspense>
    </div>
  );
}
