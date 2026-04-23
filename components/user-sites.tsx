"use client";

import { DeleteSiteAction } from "@/app/actions";
import { UserSite } from "@/app/types";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserSites() {
  const {
    data: sites,
    error,
    isLoading,
    mutate,
  } = useSWR<UserSite[]>("/api/sites", fetcher);

  if (isLoading)
    return <p className="text-sm text-neutral-500">Loading sites...</p>;
  if (error)
    return <p className="text-sm text-rose-500">Failed to load sites</p>;
  if (!sites || sites.length === 0)
    return <p className="text-sm text-neutral-500">No sites found</p>;

  const handleDelete = async (formData: FormData) => {
    await DeleteSiteAction(formData);
    mutate(); // Refresh the list after deleting
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4 text-sm font-medium">Title</th>
            <th className="py-2 px-4 text-sm font-medium">Subdomain</th>
            <th className="py-2 px-4 text-sm font-medium">Status</th>
            <th className="py-2 px-4 text-sm font-medium">Pages</th>
            <th className="py-2 px-4 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr
              key={site.id}
              className="border-b last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              <td className="py-3 px-4 text-sm">{site.header.heading}</td>
              <td className="py-3 px-4 text-sm">{site.subdomain}</td>
              <td className="py-3 px-4 text-sm">{site.status}</td>
              <td className="py-3 px-4 text-sm">{site.pageCount}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/${site.subdomain}`}
                    className="text-sm underline hover:text-neutral-600 transition-colors"
                  >
                    view
                  </Link>

                  <Link
                    href={`/editor/${site.id}`}
                    className="text-sm underline text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    edit
                  </Link>

                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={site.id} />
                    <button
                      type="submit"
                      className="text-sm text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                    >
                      delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
