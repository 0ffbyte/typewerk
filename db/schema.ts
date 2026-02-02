import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Page, SiteObject } from "@/app/types";

export const sites = pgTable("sites", {
  id: text("id")
    .primaryKey()
    .$default(() => sql`gen_random_uuid()`),
  subdomain: varchar("subdomain", { length: 256 }).unique().notNull(),
  siteObject: jsonb("site_object").$type<SiteObject>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const articles = pgTable("articles", {
  id: text("id")
    .primaryKey()
    .$default(() => sql`gen_random_uuid()`),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id),
  slug: varchar("slug", { length: 256 }).notNull(),
  content: jsonb("content").$type<Page>().notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
