"use server";

import { db } from "@/db";
import { sites } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { SiteObject } from "@/store/editor-store";

export const CreateSiteAction = async (domain: string) => {
  try {
    console.log("creating site...");

    const cleanDomain = domain.replace(/\s/g, "").trim();

    if (!cleanDomain) throw new Error("Domain is required");

    const starerTemplate: SiteObject = {
      title: domain,
      header: {
        image:
          "https://i.pinimg.com/736x/85/50/37/8550374002b693961ea0274cbd733e37.jpg",
        heading: "Hello World",
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
      .values({ domain: cleanDomain, siteObject: starerTemplate });
  } catch (error) {
    console.error("Failed to create site:", error);
    throw new Error("Failed to create site");
  }
};

export const UpdateSiteAction = async (id: string, siteObject: SiteObject) => {
  try {
    await db.update(sites).set({ siteObject }).where(eq(sites.id, id));

    return { success: true };
  } catch (error) {
    console.error("Failed to update site:", error);
    throw new Error("Failed to update site");
  }
};
