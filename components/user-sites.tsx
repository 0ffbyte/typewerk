import { DeleteSiteAction } from "@/app/actions";
import { getUserSites } from "@/db/queries";
import Link from "next/link";

export default async function UserSites() {
  const sites = await getUserSites();

  if (sites.length === 0) return <p>No sites found</p>;
  return (
    <ul className="space-y-2">
      {sites.map((site) => (
        <li key={site.id} className="grid grid-cols-2 gap-2">
          <p>{site.subdomain}</p>

          <div className="flex items-center gap-2">
            <Link href={`/${site.subdomain}`}>
              <p className="underline">view</p>
            </Link>

            <Link href={`/editor/${site.id}`}>
              <p className="underline text-blue-500">edit</p>
            </Link>

            <form action={DeleteSiteAction}>
              <input type="hidden" name="id" value={site.id} />
              <button type="submit" className="text-rose-600 cursor-pointer">
                delete
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
