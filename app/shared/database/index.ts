import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema.ts'
import { defineRelations } from 'drizzle-orm'

if (!process.env.POSTGRES_URL) {
  throw Error('POSTGRES_URL is required')
}

const relations = defineRelations(schema, (r) => ({}))
export const db = drizzle(process.env.POSTGRES_URL, {
  logger: true,
  casing: 'snake_case',
  schema,
  relations,
})
