ALTER TABLE "reports" ALTER COLUMN "filters" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "filters" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "location" text;