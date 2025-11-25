DROP INDEX "relocation_relocation_date_index";--> statement-breakpoint
ALTER TABLE "relocation" ALTER COLUMN "relocation_year" DROP EXPRESSION;--> statement-breakpoint
CREATE INDEX "relocation_relocation_year_index" ON "relocation" USING btree ("relocation_year");