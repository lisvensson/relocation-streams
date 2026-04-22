import { db } from '~/shared/database'
import { relocation } from '~/shared/database/schema'
import { union } from 'drizzle-orm/pg-core'

export type Locations = {
  postalAreas: string[]
  municipalities: string[]
  counties: string[]
}

let locations: Locations | null = null

let lastFetch = 0
const duration = 1000 * 60 * 60 * 24

export async function getLocations(): Promise<Locations> {
  const now = Date.now()

  if (locations && now - lastFetch < duration) {
    return locations
  }

  const postalAreasQuery = await union(
    db.selectDistinct({ location: relocation.toPostalArea }).from(relocation),
    db.selectDistinct({ location: relocation.fromPostalArea }).from(relocation)
  )

  const municipalitiesQuery = await union(
    db.selectDistinct({ location: relocation.toMunicipality }).from(relocation),
    db
      .selectDistinct({ location: relocation.fromMunicipality })
      .from(relocation)
  )

  const countiesQuery = await union(
    db.selectDistinct({ location: relocation.toCounty }).from(relocation),
    db.selectDistinct({ location: relocation.fromCounty }).from(relocation)
  )

  locations = {
    postalAreas: postalAreasQuery
      .map((r) => r.location)
      .filter((loc): loc is string => typeof loc === 'string')
      .sort((a, b) => a.localeCompare(b)),

    municipalities: municipalitiesQuery
      .map((r) => r.location)
      .filter((loc): loc is string => typeof loc === 'string')
      .sort((a, b) => a.localeCompare(b)),

    counties: countiesQuery
      .map((r) => r.location)
      .filter((loc): loc is string => typeof loc === 'string')
      .sort((a, b) => a.localeCompare(b)),
  }

  lastFetch = now

  return locations
}
