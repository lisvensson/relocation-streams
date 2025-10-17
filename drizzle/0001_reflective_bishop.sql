CREATE TABLE "relocation" (
	"id" text PRIMARY KEY NOT NULL,
	"relocation_date" date NOT NULL,
	"relocation_year" integer,
	"company_name" text NOT NULL,
	"employee_range" text,
	"company_type" text,
	"industry_cluster" text,
	"from_location" text[] NOT NULL,
	"to_location" text[] NOT NULL
);
