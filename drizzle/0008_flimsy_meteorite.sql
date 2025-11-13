CREATE INDEX "relocation_from_municipality_index" ON "relocation" USING btree ("from_municipality");--> statement-breakpoint
CREATE INDEX "relocation_from_location_index" ON "relocation" USING btree ("from_location");--> statement-breakpoint
CREATE INDEX "relocation_to_location_index" ON "relocation" USING btree ("to_location");