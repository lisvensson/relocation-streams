import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL) {
  throw Error('DATABASE_URL is required')
}

export default defineConfig({
  dbCredentials: { url: process.env.DATABASE_URL },
  out: './drizzle',
  schema: './app/shared/database/schema.ts',
  dialect: 'postgresql',
  casing: 'snake_case',
  verbose: true,
  strict: true,
})
