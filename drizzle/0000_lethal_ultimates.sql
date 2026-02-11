--> statement-breakpoint
CREATE TABLE "saved_charts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config" jsonb NOT NULL
);