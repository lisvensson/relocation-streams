import type { PgColumn } from 'drizzle-orm/pg-core'
import { db } from '../index.ts'
import { relocation } from '../schema.ts'
import { and, arrayContains, asc, count, inArray } from 'drizzle-orm'

export type FilterType = {
  years?: number[]
  companyTypes?: string[]
  industryClusters?: string[]
  fromLocation?: string[]
  toLocation?: string[]
}

export async function countRelocationsBy(
  column: PgColumn,
  filters: FilterType
) {
  const where = and(
    filters.years?.length
      ? inArray(relocation.relocationYear, filters.years)
      : undefined,
    filters.companyTypes?.length
      ? inArray(relocation.companyType, filters.companyTypes)
      : undefined,
    filters.industryClusters?.length
      ? inArray(relocation.industryCluster, filters.industryClusters)
      : undefined,
    filters.fromLocation?.filter(Boolean).length
      ? arrayContains(
          relocation.toLocation,
          filters.fromLocation.filter(Boolean)
        )
      : undefined,
    filters.toLocation?.filter(Boolean).length
      ? arrayContains(relocation.toLocation, filters.toLocation.filter(Boolean))
      : undefined
  )

  const result = await db
    .select({ key: column, value: count() })
    .from(relocation)
    .where(where)
    .groupBy(column)
    .orderBy(asc(column))

  return result
}
