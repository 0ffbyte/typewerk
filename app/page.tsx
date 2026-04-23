import { SignIn } from "@/components/auth-buttons";
import NavBar from "@/components/nav-bar";
import NewSite from "@/components/new-site";
import UserSites from "@/components/user-sites";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <div className="flex flex-col font-sans max-w-[1024px] mx-auto pt-16 px-1 w-full">
      <NavBar />

      <div className="mt-[64px] space-y-4">
        {session ? (
          <>
            <div className="mt-4 text-xl font-semibold">Morning, {"User"}</div>
            <NewSite />
            <UserSites />
          </>
        ) : (
          <SignIn />
        )}
      </div>
    </div>
  );
}
