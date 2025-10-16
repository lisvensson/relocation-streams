import "dotenv/config"
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.ts";

if (!process.env.POSTGRES_URL) {
  throw Error("POSTGRES_URL is required");
}

export const db = drizzle(process.env.POSTGRES_URL, {
  logger: true,
  casing: "snake_case",
  schema,
});
 