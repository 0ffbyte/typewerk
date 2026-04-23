import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "./index";
import { sites } from "./schema";
import { unstable_cache } from "next/cache";
import { verifySession } from "@/lib/auth";

export const getUserSites = async () => {
  const { user } = await verifySession();
  const data = await db
    .select({
      id: sites.id,
      header: sites.header,
      status: sites.status,
      subdomain: sites.subdomain,
      pageCount: sql<number>`jsonb_array_length(${sites.pages})`,
      createdAt: sites.createdAt,
    })
    .from(sites)
    .where(eq(sites.userId, user.id))
    .orderBy(desc(sites.createdAt));
  return data;
};

export const getSite = async (id: string) => {
  const { user } = await verifySession();
  const data = await db
    .select({
      id: sites.id,
      header: sites.header,
      theme: sites.theme,
      pages: sites.pages,
    })
    .from(sites)
    .where(and(eq(sites.id, id), eq(sites.userId, user.id)));

  if (!data) return null;

  return data[0];
};

export const getSiteCached = async (subdomain: string) => {
  const cached_user = unstable_cache(
    async () => {
      const data = await db
        .select({
          id: sites.id,
          header: sites.header,
          theme: sites.theme,
          pages: sites.pages,
        })
        .from(sites)
        .where(eq(sites.subdomain, subdomain))
        .limit(1);
      return data[0];
    },
    [subdomain],
    {
      tags: [`site-${subdomain}`],
    }
  );

  const data = await cached_user();
  return data;
};
