CREATE INDEX "relocation_relocation_year_index" ON "relocation" USING btree ("relocation_year");--> statement-breakpoint
CREATE INDEX "relocation_employee_range_index" ON "relocation" USING btree ("employee_range");--> statement-breakpoint
CREATE INDEX "relocation_company_type_index" ON "relocation" USING btree ("company_type");--> statement-breakpoint
CREATE INDEX "relocation_industry_cluster_index" ON "relocation" USING btree ("industry_cluster");