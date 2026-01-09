import { getSites } from "@/db/queries";
import Link from "next/link";

export default async function UserSites() {
  const sites = await getSites();

  if (sites.length === 0) return <p>No sites found</p>;
  return (
    <ul className="space-y-2">
      {sites.map((site) => (
        <Link key={site.id} href={`/editor/${site.id}`}>
          <li className="underline">{site.domain}</li>
        </Link>
      ))}
    </ul>
  );
}
