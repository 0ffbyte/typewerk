import { eq } from "drizzle-orm";
import { db } from "./index";
import { sites } from "./schema";

export const getSites = async () => {
  const data = await db.select().from(sites);
  return data;
};

export const getSite = async (id: string) => {
  const data = await db.select().from(sites).where(eq(sites.id, id)).limit(1);

  return data[0];
};

export const getSiteByDomain = async (domain: string) => {
  const data = await db
    .select()
    .from(sites)
    .where(eq(sites.domain, domain))
    .limit(1);

  return data[0];
};
