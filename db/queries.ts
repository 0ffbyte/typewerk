import { eq, and } from "drizzle-orm";
import { db } from "./index";
import { sites } from "./schema";
import { unstable_cache } from "next/cache";

export const getSites = async () => {
  const data = await db.select().from(sites);
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
      revalidate: 60 * 3,
    }
  );

  const data = await cached_user();
  return data;
};
