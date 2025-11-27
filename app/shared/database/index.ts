import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema.ts'
import { defineRelations } from 'drizzle-orm'

if (!process.env.DATABASE_URL) {
  throw Error('DATABASE_URL is required')
}

const relations = defineRelations(schema, (r) => ({}))

export const db = drizzle(process.env.DATABASE_URL, {
  logger: true,
  casing: 'snake_case',
  schema,
  relations,
})
