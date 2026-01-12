ALTER TABLE "sites" RENAME COLUMN "domain" TO "subdomain";--> statement-breakpoint
ALTER TABLE "sites" DROP CONSTRAINT "sites_domain_unique";--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_subdomain_unique" UNIQUE("subdomain");