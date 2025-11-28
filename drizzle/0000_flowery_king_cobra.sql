CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relocation" (
	"id" uuid NOT NULL,
	"relocation_date" date NOT NULL,
	"relocation_year" integer GENERATED ALWAYS AS (EXTRACT(YEAR FROM relocation_date)) STORED,
	"employee_range" text,
	"company_type" text,
	"industry_cluster" text,
	"from_location" text[] NOT NULL,
	"to_location" text[] NOT NULL,
	"from_postal_area" text,
	"to_postal_area" text,
	"from_municipality" text,
	"to_municipality" text,
	"from_county" text,
	"to_county" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "relocation_from_location_index" ON "relocation" USING btree ("from_location");--> statement-breakpoint
CREATE INDEX "relocation_to_location_index" ON "relocation" USING btree ("to_location");--> statement-breakpoint
CREATE INDEX "relocation_from_postal_area_index" ON "relocation" USING btree ("from_postal_area");--> statement-breakpoint
CREATE INDEX "relocation_to_postal_area_index" ON "relocation" USING btree ("to_postal_area");--> statement-breakpoint
CREATE INDEX "relocation_from_municipality_index" ON "relocation" USING btree ("from_municipality");--> statement-breakpoint
CREATE INDEX "relocation_to_municipality_index" ON "relocation" USING btree ("to_municipality");--> statement-breakpoint
CREATE INDEX "relocation_from_county_index" ON "relocation" USING btree ("from_county");--> statement-breakpoint
CREATE INDEX "relocation_to_county_index" ON "relocation" USING btree ("to_county");