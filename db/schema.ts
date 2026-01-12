import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import type { EditorState } from "@/store/editor-store";

export const sites = pgTable("sites", {
  id: text("id")
    .primaryKey()
    .$default(() => sql`gen_random_uuid()`),
  subdomain: varchar("subdomain", { length: 256 }).unique().notNull(),
  siteObject: jsonb("site_object").$type<EditorState["data"]>().notNull(),
  published: boolean("published").default(false).notNull(),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
