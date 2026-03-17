CREATE TABLE "shared_reports" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"charts" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
