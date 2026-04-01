import { eq } from "drizzle-orm";
import { db } from "./index";
import { sites } from "./schema";
import { unstable_cache } from "next/cache";
import { verifySession } from "@/lib/auth";

export const getUserSites = async () => {
  const { user } = await verifySession();
  const data = await db
    .select({
      id: sites.id,
      subdomain: sites.subdomain,
    })
    .from(sites)
    .where(eq(sites.userId, user.id))
    .limit(10);
  return data;
};

export const getSite = async (subdomain: string) => {
  const data = await db
    .select()
    .from(sites)
    .where(eq(sites.subdomain, subdomain))
    .limit(1);

  return data[0];
};

export const getSiteCached = async (subdomain: string) => {
  const cached_user = unstable_cache(
    async () => {
      const data = await db
        .select()
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
