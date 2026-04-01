"use server";

import { db } from "@/db";
import { sites } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { SiteObject } from "./types";
import { revalidateTag } from "next/cache";
import { verifySession } from "@/lib/auth";

export const CreateSiteAction = async (subdomain: string) => {
  try {
    console.log("creating site...");
    const { user } = await verifySession();

    // Sanitize subdomain
    const sanitizedSubdomain = subdomain
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 63);

    if (!sanitizedSubdomain || sanitizedSubdomain.length === 0) {
      throw new Error("Subdomain is required");
    }

    const starterTemplate: SiteObject = {
      header: {
        image: "",
        heading: "Hello, World",
        subheading: "Welcome to your new site",
      },
      pages: [
        {
          id: crypto.randomUUID(),
          name: "home",
          blocks: [
            {
              id: crypto.randomUUID(),
              type: "text",
              props: {
                content: "Hello, World",
              },
            },
          ],
        },
      ],
      theme: {
        accent: "blue",
        typography: "sans",
      },
    };

    // Create site
    await db.insert(sites).values({
      userId: user.id,
      siteObject: starterTemplate,
      subdomain: sanitizedSubdomain,
    });
  } catch (error) {
    console.error("Failed to create site:", error);
    throw new Error("Failed to create site");
  }
};

export const UpdateSiteAction = async (id: string, siteObject: SiteObject) => {
  try {
    const { user } = await verifySession();

    await db
      .update(sites)
      .set({ siteObject })
      .where(and(eq(sites.id, id), eq(sites.userId, user.id)));
    console.log("page updated");
  } catch (error) {
    console.error("Failed to update site:", error);
    throw new Error("Failed to update site");
  }
};

export const RevalidateSiteAction = async (id: string) => {
  try {
    const data = await db
      .select({ subdomain: sites.subdomain })
      .from(sites)
      .where(eq(sites.id, id))
      .limit(1);

    const subdomain = data[0]?.subdomain;
    if (!subdomain) throw new Error("No subdomain found");
    revalidateTag(`site-${subdomain}`, "max");
  } catch (error) {
    console.error("Failed to revalidate site:", error);
    throw new Error("Failed to revalidate site");
  }
};

export const DeleteSiteAction = async (formdata: FormData) => {
  try {
    const id = formdata.get("id") as string;
    console.log("id:", id);
    if (!id) throw new Error("No id provided");
    await db.delete(sites).where(eq(sites.id, id));
  } catch (error) {
    console.error("Failed to delete site:", error);
    throw new Error("Failed to delete site");
  }
};
