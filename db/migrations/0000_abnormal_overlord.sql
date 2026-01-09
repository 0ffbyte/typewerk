CREATE TABLE "sites" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" varchar(256) NOT NULL,
	"site_object" jsonb NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"thumbnail" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sites_domain_unique" UNIQUE("domain")
);
