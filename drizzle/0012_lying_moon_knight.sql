CREATE INDEX "relocation_from_postal_area_index" ON "relocation" USING btree ("from_postal_area");--> statement-breakpoint
CREATE INDEX "relocation_to_postal_area_index" ON "relocation" USING btree ("to_postal_area");--> statement-breakpoint
CREATE INDEX "relocation_to_municipality_index" ON "relocation" USING btree ("to_municipality");--> statement-breakpoint
CREATE INDEX "relocation_from_county_index" ON "relocation" USING btree ("from_county");--> statement-breakpoint
CREATE INDEX "relocation_to_county_index" ON "relocation" USING btree ("to_county");