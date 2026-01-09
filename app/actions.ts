"use server";

import { db } from "@/db";
import { sites } from "@/db/schema";
import type { EditorState } from "@/store/editor-store";

export const CreateSiteAction = async () => {
  console.log("creating site...");

  const starerTemplate: EditorState["data"] = {
    title: "emilee",
    header: {
      image:
        "https://i.pinimg.com/736x/85/50/37/8550374002b693961ea0274cbd733e37.jpg",
      heading: "Emily Lee",
      subheading: "Designe Engineer",
    },
    blocks: [
      {
        uuid: crypto.randomUUID(),
        type: "section",
        props: {
          title: "About Me",
        },
      },
      {
        uuid: crypto.randomUUID(),
        type: "text",
        props: {
          content:
            "I'm a software engineer and designer who loves to build things. I'm passionate about creating beautiful and functional user interfaces, and I'm always looking for ways to improve my skills and knowledge.",
        },
      },
      {
        uuid: crypto.randomUUID(),
        type: "image",
        props: {
          url: "https://i.pinimg.com/1200x/b4/a0/cd/b4a0cd13d628469d39e374ab2da77989.jpg",
        },
      },
    ],
  };

  await db
    .insert(sites)
    .values({ domain: "emily", siteObject: starerTemplate });
};
