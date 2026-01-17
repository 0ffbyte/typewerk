"use server";

import { db } from "@/db";
import { sites } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { SiteObject } from "@/store/editor-store";
import { revalidateTag } from "next/cache";

export const CreateSiteAction = async (subdomain: string) => {
  try {
    console.log("creating site...");

    const sanitizedSubdomain = subdomain
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 63); // Enforce max length

    if (!sanitizedSubdomain || sanitizedSubdomain.length === 0) {
      throw new Error("Subdomain is required");
    }

    const starerTemplate: SiteObject = {
      title: subdomain,
      header: {
        image:
          "https://i.pinimg.com/736x/85/50/37/8550374002b693961ea0274cbd733e37.jpg",
        heading: `Hello, ${subdomain}`,
        subheading: "Welcome to your new site",
      },
      blocks: [
        {
          uuid: crypto.randomUUID(),
          type: "section",
          props: {
            title: "About",
          },
        },
        {
          uuid: crypto.randomUUID(),
          type: "text",
          props: {
            content:
              "This is a sample site. Start by deleting this block and adding your own <b>content</b>.",
          },
        },
      ],
    };

    await db
      .insert(sites)
      .values({ subdomain: sanitizedSubdomain, siteObject: starerTemplate });
  } catch (error) {
    console.error("Failed to create site:", error);
    throw new Error("Failed to create site");
  }
};

export const UpdateSiteAction = async (id: string, siteObject: SiteObject) => {
  try {
    const data = await db
      .update(sites)
      .set({ siteObject })
      .where(eq(sites.id, id))
      .returning();
    console.log("site updated");

    revalidateTag("site-" + data[0].subdomain, "max");
  } catch (error) {
    console.error("Failed to update site:", error);
    throw new Error("Failed to update site");
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
