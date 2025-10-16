import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.POSTGRES_URL) {
  throw Error("POSTGRES_URL is required");
}

export default defineConfig({
  dbCredentials: { url: process.env.POSTGRES_URL },
  out: './drizzle',
  schema: './app/shared/database/schema.ts',
  dialect: 'postgresql',
  casing: "snake_case",
  verbose: true,
  strict: true,
});