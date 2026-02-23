import { sql } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  boolean,
  date,
  integer,
  uuid,
  index,
  jsonb,
} from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable('session', {
  id: text().primaryKey(),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  password: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const verification = pgTable('verification', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const relocation = pgTable(
  'relocation',
  {
    id: uuid().notNull(),
    relocationDate: date().notNull(),
    relocationYear: integer().generatedAlwaysAs(
      sql`EXTRACT(YEAR FROM relocation_date)`
    ),
    employeeRange: text(),
    companyType: text(),
    industryCluster: text(),
    fromLocation: text().array().notNull(),
    toLocation: text().array().notNull(),
    fromPostalArea: text(),
    toPostalArea: text(),
    fromMunicipality: text(),
    toMunicipality: text(),
    fromCounty: text(),
    toCounty: text(),
  },
  (table) => {
    return [
      index().on(table.relocationYear),
      index().on(table.employeeRange),
      index().on(table.companyType),
      index().on(table.industryCluster),
      index('relocation_from_location_gin').using('gin', table.fromLocation),
      index('relocation_to_location_gin').using('gin', table.toLocation),
      index().on(table.fromPostalArea),
      index().on(table.toPostalArea),
      index().on(table.fromMunicipality),
      index().on(table.toMunicipality),
      index().on(table.fromCounty),
      index().on(table.toCounty),
    ]
  }
)

export const reports = pgTable('reports', {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text().notNull(),
  location: text(),
  filters: jsonb(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const charts = pgTable('charts', {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  reportId: uuid()
    .notNull()
    .references(() => reports.id, { onDelete: 'cascade' }),
  config: jsonb().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
})
