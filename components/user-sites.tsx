import { getSites } from "@/db/queries";
import Link from "next/link";

export default async function UserSites() {
  const sites = await getSites();

  if (sites.length === 0) return <p>No sites found</p>;
  return (
    <ul className="space-y-2">
      {sites.map((site) => (
        <li key={site.id} className="flex items-center gap-8">
          <p>{site.domain}</p>

          <div className="flex items-center gap-2">
            <Link href={`/${site.domain}`}>
              <p className="underline">view</p>
            </Link>

            <Link href={`/editor/${site.id}`}>
              <p className="underline text-blue-600">edit</p>
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
