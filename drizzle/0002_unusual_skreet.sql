ALTER TABLE "relocation" drop column "relocation_year";--> statement-breakpoint
ALTER TABLE "relocation" ADD COLUMN "relocation_year" integer GENERATED ALWAYS AS (EXTRACT(YEAR FROM relocation_date)) STORED;--> statement-breakpoint
ALTER TABLE "relocation" DROP COLUMN "company_name";