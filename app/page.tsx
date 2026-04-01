import { SignIn, SignOut } from "@/components/auth-buttons";
import NewSite from "@/components/new-site";
import UserSites from "@/components/user-sites";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  return (
    <div className="flex flex-col min-h-screen items-start justify-start md:w-[800px] pt-[44] md:pt-[64] pb-[24] px-[12] md:px-[64px] mx-auto font-sans">
      <h1 className="text-[32px] font-semibold">Welcome to typewerk 0.7.0</h1>

      <div className="mt-[64px] space-y-4">
        {session ? (
          <>
            <div className="mt-4 text-lg">
              Hello, {session.user?.name || "User"}!
            </div>
            <div className="mt-4 mb-12 space-y-2">
              <NewSite />
              <UserSites />
            </div>
            <SignOut />
          </>
        ) : (
          <SignIn />
        )}
      </div>
    </div>
  );
}
