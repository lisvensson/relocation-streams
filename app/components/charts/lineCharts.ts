import { and, arrayContains, count, inArray, asc, sql } from 'drizzle-orm'
import type {
  Diagram,
  DiagramGenerator,
  DiagramPart,
} from '~/models/diagramModels'
import { db } from '~/shared/database'
import { relocation } from '~/shared/database/schema'

const uniqueValues = (values) => {
  return Array.from(new Set(values))
}

//Flyttar per år till location volym line chart
export const relocationsToByYearVolumeLineChart: DiagramGenerator = async (
  filters
) => {
  const where = and(
    filters.years?.length
      ? inArray(relocation.relocationYear, filters.years)
      : undefined,
    filters.employeeRange?.length
      ? inArray(relocation.employeeRange, filters.employeeRange)
      : undefined,
    filters.companyTypes?.length
      ? inArray(relocation.companyType, filters.companyTypes)
      : undefined,
    filters.industryClusters?.length
      ? inArray(relocation.industryCluster, filters.industryClusters)
      : undefined,
    filters.location?.length
      ? arrayContains(relocation.toLocation, [filters.location])
      : undefined
  )

  const result = await db
    .select({ key: relocation.relocationYear, value: count() })
    .from(relocation)
    .where(where)
    .groupBy(relocation.relocationYear)
    .orderBy(asc(relocation.relocationYear))

  const chartData = result.map((r) => {
    return {
      year: r.key as number,
      relocations: r.value,
    }
  })

  const diagram: Diagram = {
    title: `Flyttar per år till ${filters.location}`,
    type: 'line',
    axis: {
      x: { label: 'År', dataKey: 'year' },
      y: { label: 'Antal flyttar' },
    },
    parts: [
      {
        type: 'line',
        label: `Till ${filters.location}`,
        dataKey: 'relocations',
        color: 'var(--chart-1)',
      },
    ],
    chartData,
  }

  return diagram
}

//Inflyttar per år från plats till ${location} volym line chart
export const relocationsToByYearFromLocationVolumeLineChart: DiagramGenerator =
  async (filters) => {
    const where = and(
      filters.years?.length
        ? inArray(relocation.relocationYear, filters.years)
        : undefined,
      filters.employeeRange?.length
        ? inArray(relocation.employeeRange, filters.employeeRange)
        : undefined,
      filters.companyTypes?.length
        ? inArray(relocation.companyType, filters.companyTypes)
        : undefined,
      filters.industryClusters?.length
        ? inArray(relocation.industryCluster, filters.industryClusters)
        : undefined,
      filters.location?.length
        ? arrayContains(relocation.toLocation, [filters.location])
        : undefined
    )

    const result = await db
      .select({ key: relocation.relocationYear, value: count() })
      .from(relocation)
      .where(where)
      .groupBy(relocation.relocationYear)
      .orderBy(asc(relocation.relocationYear))

    const resultByLocation = await db
      .select({
        key: relocation.relocationYear,
        fromLocation: relocation.fromMunicipality,
        value: count(),
      })
      .from(relocation)
      .where(where)
      .groupBy(relocation.relocationYear, relocation.fromMunicipality)
      .orderBy(asc(relocation.relocationYear))

    const resultTotalFromLocation = await db
      .select({
        fromLocation: relocation.fromMunicipality,
        value: count(),
      })
      .from(relocation)
      .where(where)
      .groupBy(relocation.fromMunicipality)

    resultTotalFromLocation.sort((a, b) => b.value - a.value)
    const topLocations = resultTotalFromLocation.slice(0, 10)

    const years = result.map((r) => r.key)

    const chartData = []

    for (const year of years) {
      const yearData = {
        year: year,
        totalRelocations: result.find((row) => row.key === year)?.value ?? 0,
      }

      const filteredRows = resultByLocation.filter((row) => row.key === year)
      for (const row of filteredRows) {
        yearData[row.fromLocation] = row.value
      }
      chartData.push(yearData)
    }

    const locationNames = topLocations.map((r) => r.fromLocation)
    const uniqueLocationNames = uniqueValues(locationNames)

    const parts = []

    for (const name of uniqueLocationNames) {
      const part = {
        type: 'line',
        label: `Till ${name}`,
        dataKey: name,
        color: 'var(--chart-2)',
      }
      parts.push(part)
    }

    const diagram: Diagram = {
      title: `Inflyttar per år från plats till ${filters.location} (volym)`,
      type: 'line',
      axis: {
        x: { label: 'År', dataKey: 'year' },
        y: { label: 'Antal flyttar' },
      },
      parts,
      chartData,
    }

    return diagram
  }

//Flyttar per år från location volym line chart
export const relocationsFromByYearLineChart: DiagramGenerator = async (
  filters
) => {
  const where = and(
    filters.years?.length
      ? inArray(relocation.relocationYear, filters.years)
      : undefined,
    filters.employeeRange?.length
      ? inArray(relocation.employeeRange, filters.employeeRange)
      : undefined,
    filters.companyTypes?.length
      ? inArray(relocation.companyType, filters.companyTypes)
      : undefined,
    filters.industryClusters?.length
      ? inArray(relocation.industryCluster, filters.industryClusters)
      : undefined,
    filters.location?.length
      ? arrayContains(relocation.fromLocation, [filters.location])
      : undefined
  )

  const result = await db
    .select({ key: relocation.relocationYear, value: count() })
    .from(relocation)
    .where(where)
    .groupBy(relocation.relocationYear)
    .orderBy(asc(relocation.relocationYear))

  const chartData = result.map((r) => {
    return {
      year: r.key as number,
      relocations: r.value,
    }
  })

  const diagram: Diagram = {
    title: `Flyttar per år från ${filters.location}`,
    type: 'line',
    axis: {
      x: { label: 'År', dataKey: 'year' },
      y: { label: 'Antal flyttar' },
    },
    parts: [
      {
        type: 'line',
        label: `Från ${filters.location}`,
        dataKey: 'relocations',
        color: 'var(--chart-1)',
      },
    ],
    chartData,
  }

  return diagram
}

//Utflyttar per år till plats från ${location} volym line chart
export const relocationsFromByYearToLocationVolumeLineChart: DiagramGenerator =
  async (filters) => {
    const where = and(
      filters.years?.length
        ? inArray(relocation.relocationYear, filters.years)
        : undefined,
      filters.employeeRange?.length
        ? inArray(relocation.employeeRange, filters.employeeRange)
        : undefined,
      filters.companyTypes?.length
        ? inArray(relocation.companyType, filters.companyTypes)
        : undefined,
      filters.industryClusters?.length
        ? inArray(relocation.industryCluster, filters.industryClusters)
        : undefined,
      filters.location?.length
        ? arrayContains(relocation.fromLocation, [filters.location])
        : undefined
    )

    const result = await db
      .select({ key: relocation.relocationYear, value: count() })
      .from(relocation)
      .where(where)
      .groupBy(relocation.relocationYear)
      .orderBy(asc(relocation.relocationYear))

    const resultByLocation = await db
      .select({
        key: relocation.relocationYear,
        toLocation: relocation.toMunicipality,
        value: count(),
      })
      .from(relocation)
      .where(where)
      .groupBy(relocation.relocationYear, relocation.toMunicipality)
      .orderBy(asc(relocation.relocationYear))

    const resultTotalToLocation = await db
      .select({
        toLocation: relocation.toMunicipality,
        value: count(),
      })
      .from(relocation)
      .where(where)
      .groupBy(relocation.toMunicipality)

    resultTotalToLocation.sort((a, b) => b.value - a.value)
    const topLocations = resultTotalToLocation.slice(0, 10)

    const years = result.map((r) => r.key)

    const chartData = []

    for (const year of years) {
      const yearData = {
        year: year,
        totalRelocations: result.find((row) => row.key === year)?.value ?? 0,
      }

      const filteredRows = resultByLocation.filter((row) => row.key === year)
      for (const row of filteredRows) {
        yearData[row.toLocation] = row.value
      }
      chartData.push(yearData)
    }

    const locationNames = topLocations.map((r) => r.toLocation)
    const uniqueLocationNames = uniqueValues(locationNames)

    const parts = []

    for (const name of uniqueLocationNames) {
      const part = {
        type: 'line',
        label: `Till ${name}`,
        dataKey: name,
        color: 'var(--chart-2)',
      }
      parts.push(part)
    }

    const diagram: Diagram = {
      title: `Utflyttar per år till plats från ${filters.location} (volym)`,
      type: 'line',
      axis: {
        x: { label: 'År', dataKey: 'year' },
        y: { label: 'Antal flyttar' },
      },
      parts,
      chartData,
    }

    return diagram
  }

//Flyttar per år till och från location volym line chart
export const relocationsToAndFromLineChart: DiagramGenerator = async (
  filters
) => {
  const whereTo = and(
    filters.years?.length
      ? inArray(relocation.relocationYear, filters.years)
      : undefined,
    filters.employeeRange?.length
      ? inArray(relocation.employeeRange, filters.employeeRange)
      : undefined,
    filters.companyTypes?.length
      ? inArray(relocation.companyType, filters.companyTypes)
      : undefined,
    filters.industryClusters?.length
      ? inArray(relocation.industryCluster, filters.industryClusters)
      : undefined,
    filters.location?.length
      ? arrayContains(relocation.toLocation, [filters.location])
      : undefined
  )

  const whereFrom = and(
    filters.years?.length
      ? inArray(relocation.relocationYear, filters.years)
      : undefined,
    filters.employeeRange?.length
      ? inArray(relocation.employeeRange, filters.employeeRange)
      : undefined,
    filters.companyTypes?.length
      ? inArray(relocation.companyType, filters.companyTypes)
      : undefined,
    filters.industryClusters?.length
      ? inArray(relocation.industryCluster, filters.industryClusters)
      : undefined,
    filters.location?.length
      ? arrayContains(relocation.fromLocation, [filters.location])
      : undefined
  )

  const resultTo = await db
    .select({ keyTo: relocation.relocationYear, valueTo: count() })
    .from(relocation)
    .where(whereTo)
    .groupBy(relocation.relocationYear)
    .orderBy(asc(relocation.relocationYear))

  const resultFrom = await db
    .select({ keyFrom: relocation.relocationYear, valueFrom: count() })
    .from(relocation)
    .where(whereFrom)
    .groupBy(relocation.relocationYear)
    .orderBy(asc(relocation.relocationYear))

  const chartData = resultTo.map((r) => {
    const year = r.keyTo as number
    const toCount = r.valueTo
    const fromCount =
      resultFrom.find((f) => f.keyFrom === r.keyTo)?.valueFrom ?? 0
    return {
      year,
      toCount,
      fromCount,
    }
  })

  const diagram: Diagram = {
    title: `Flyttar per år ${filters.location}`,
    type: 'line',
    axis: {
      x: { label: 'År', dataKey: 'year' },
      y: { label: 'Antal flyttar' },
    },
    parts: [
      {
        type: 'line',
        dataKey: 'toCount',
        label: `Till ${filters.location}`,
        color: 'var(--chart-2)',
      },
      {
        type: 'line',
        dataKey: 'fromCount',
        label: `Från ${filters.location}`,
        color: 'var(--chart-1)',
      },
    ],
    chartData,
  }

  return diagram
}

//Storlek på inflyttade företag per år till location volym line chart
export const relocationsToByYearByEmployeeRangeVolumeLineChart: DiagramGenerator =
  async (filters) => {
    const where = and(
      filters.years?.length
        ? inArray(relocation.relocationYear, filters.years)
        : undefined,
      filters.employeeRange?.length
        ? inArray(relocation.employeeRange, filters.employeeRange)
        : undefined,
      filters.companyTypes?.length
        ? inArray(relocation.companyType, filters.companyTypes)
        : undefined,
      filters.industryClusters?.length
        ? inArray(relocation.industryCluster, filters.industryClusters)
        : undefined,
      filters.location?.length
        ? arrayContains(relocation.toLocation, [filters.location])
        : undefined
    )

    const result = await db
      .select({
        key: relocation.relocationYear,
        size: relocation.employeeRange,
        value: count(),
      })
      .from(relocation)
      .where(where)
      .groupBy(relocation.relocationYear, relocation.employeeRange)
      .orderBy(
        asc(relocation.relocationYear),
        asc(
          sql`CAST(SPLIT_PART(${relocation.employeeRange}, '-', 1) AS INTEGER)`
        )
      )

    const years = result.map((r) => r.key)

    const chartData = []

    for (const year of years) {
      const yearData = {
        year: year,
        relocations: result.find((row) => row.key === year)?.value ?? 0,
      }

      const filteredRows = result.filter((row) => row.key === year)
      for (const row of filteredRows) {
        yearData[row.size] = row.value
      }
      chartData.push(yearData)
    }

    const employeeRanges = result.map((r) => r.size)
    const uniqueEmployeeRanges = uniqueValues(employeeRanges)

    const parts = []

    for (const range of uniqueEmployeeRanges) {
      const part = {
        type: 'line',
        label: `${range} anställda`,
        dataKey: range,
        color: 'var(--chart-2)',
      }
      parts.push(part)
    }

    const diagram: Diagram = {
      title: `Storlek på inflyttade företag per år till ${filters.location}`,
      type: 'line',
      axis: {
        x: { label: 'År', dataKey: 'year' },
        y: { label: 'Antal flyttar' },
      },
      parts,
      chartData,
    }

    return diagram
  }
