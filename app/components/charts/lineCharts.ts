import { and, arrayContains, count, inArray, asc, sql } from 'drizzle-orm'
import type { Diagram, DiagramGenerator } from '~/models/diagramModels'
import { db } from '~/shared/database'
import { relocation } from '~/shared/database/schema'

const uniqueValues = (values) => {
  return Array.from(new Set(values))
}

//Flyttar per år till ${location} (volym) line chart
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

  const years = result.map((r) => r.key)
  const chartData: Record<string, string | number>[] = []

  for (const year of years) {
    const yearData = {
      year: year ?? 0,
      totalRelocations: result.find((row) => row.key === year)?.value ?? 0,
    }
    chartData.push(yearData)
  }

  const diagram: Diagram = {
    title: `Flyttar per år till ${filters.location} (volym)`,
    type: 'line',
    axis: {
      x: { label: 'År', dataKey: 'year' },
      y: { label: 'Antal flyttar' },
    },
    parts: [
      {
        type: 'line',
        label: `Till ${filters.location}`,
        dataKey: 'totalRelocations',
        color: 'var(--chart-1)',
      },
    ],
    chartData,
  }

  return diagram
}

//Flyttar per år från ${location} (volym) line chart
export const relocationsFromByYearVolumeLineChart: DiagramGenerator = async (
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

  const years = result.map((r) => r.key)
  const chartData: Record<string, string | number>[] = []

  for (const year of years) {
    const yearData = {
      year: year ?? 0,
      totalRelocations: result.find((row) => row.key === year)?.value ?? 0,
    }
    chartData.push(yearData)
  }

  const diagram: Diagram = {
    title: `Flyttar per år från ${filters.location} (volym)`,
    type: 'line',
    axis: {
      x: { label: 'År', dataKey: 'year' },
      y: { label: 'Antal flyttar' },
    },
    parts: [
      {
        type: 'line',
        label: `Från ${filters.location}`,
        dataKey: 'totalRelocations',
        color: 'var(--chart-1)',
      },
    ],
    chartData,
  }

  return diagram
}

//Flyttar per år till och från location (volym) line chart
export const relocationsToAndFromVolumeLineChart: DiagramGenerator = async (
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
    .select({ key: relocation.relocationYear, value: count() })
    .from(relocation)
    .where(whereTo)
    .groupBy(relocation.relocationYear)
    .orderBy(asc(relocation.relocationYear))

  const resultFrom = await db
    .select({ key: relocation.relocationYear, value: count() })
    .from(relocation)
    .where(whereFrom)
    .groupBy(relocation.relocationYear)
    .orderBy(asc(relocation.relocationYear))

  const yearsTo = resultTo.map((r) => r.key)
  const yearsFrom = resultFrom.map((r) => r.key)
  const chartData: Record<string, string | number>[] = []

  for (const year of yearsTo && yearsFrom) {
    const yearData = {
      year: year ?? 0,
      toCount: resultTo.find((row) => row.key === year)?.value ?? 0,
      fromCount: resultFrom.find((row) => row.key === year)?.value ?? 0,
    }
    chartData.push(yearData)
  }

  const diagram: Diagram = {
    title: `Flyttar per år till och från ${filters.location} (volym)`,
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
        color: 'var(--chart-1)',
      },
      {
        type: 'line',
        dataKey: 'fromCount',
        label: `Från ${filters.location}`,
        color: 'var(--chart-11)',
      },
    ],
    chartData,
  }

  return diagram
}

//Inflyttar per år till ${location} (volym) line chart
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
    const chartData: Record<string, string | number>[] = []

    for (const year of years) {
      const yearData = {
        year: year ?? 0,
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

    for (let i = 0; i < uniqueLocationNames.length; i++) {
      const name = uniqueLocationNames[i]
      const part = {
        type: 'line',
        label: `Från ${name}`,
        dataKey: name,
        color: `var(--chart-${(i % 10) + 1})`,
      }
      parts.push(part)
    }

    const diagram: Diagram = {
      title: `Inflyttar per år till ${filters.location} (volym)`,
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

//Inflyttar per år till ${location} (procent) line chart
export const relocationsToByYearFromLocationPercentLineChart: DiagramGenerator =
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
    const locationNames = topLocations.map((r) => r.fromLocation)

    const years = result.map((r) => r.key)
    const chartData: Record<string, string | number>[] = []

    for (const year of years) {
      const yearData = {
        year: year ?? 0,
        totalRelocations: result.find((row) => row.key === year)?.value ?? 0,
      }

      const filteredRows = resultByLocation.filter(
        (row) => row.key === year && locationNames.includes(row.fromLocation)
      )

      let total = 0
      for (const row of filteredRows) {
        total += row.value
      }

      for (const row of filteredRows) {
        yearData[row.fromLocation] = Math.round((row.value / total) * 100)
      }
      chartData.push(yearData)
    }

    const uniqueLocationNames = uniqueValues(locationNames)

    const parts = []

    for (let i = 0; i < uniqueLocationNames.length; i++) {
      const name = uniqueLocationNames[i]
      const part = {
        type: 'line',
        label: `Från ${name}`,
        dataKey: name,
        color: `var(--chart-${(i % 10) + 1})`,
      }
      parts.push(part)
    }

    const diagram: Diagram = {
      title: `Inflyttar per år till ${filters.location} (procent)`,
      type: 'line',
      axis: {
        x: { label: 'År', dataKey: 'year' },
        y: { label: 'Andel av inflytt (%)' },
      },
      parts,
      chartData,
    }

    return diagram
  }

//Utflyttar per år från ${location} (volym) line chart
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
    const chartData: Record<string, string | number>[] = []

    for (const year of years) {
      const yearData = {
        year: year ?? 0,
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

    for (let i = 0; i < uniqueLocationNames.length; i++) {
      const name = uniqueLocationNames[i]
      const part = {
        type: 'line',
        label: `Till ${name}`,
        dataKey: name,
        color: `var(--chart-${(i % 10) + 1})`,
      }
      parts.push(part)
    }

    const diagram: Diagram = {
      title: `Utflyttar per år från ${filters.location} (volym)`,
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

//Utflyttar per år från ${location} (percent) line chart
export const relocationsFromByYearToLocationPercentLineChart: DiagramGenerator =
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
    const locationNames = topLocations.map((r) => r.toLocation)

    const years = result.map((r) => r.key)
    const chartData: Record<string, string | number>[] = []

    for (const year of years) {
      const yearData = {
        year: year ?? 0,
        totalRelocations: result.find((row) => row.key === year)?.value ?? 0,
      }

      const filteredRows = resultByLocation.filter(
        (row) => row.key === year && locationNames.includes(row.toLocation)
      )

      let total = 0
      for (const row of filteredRows) {
        total += row.value
      }

      for (const row of filteredRows) {
        yearData[row.toLocation] = Math.round((row.value / total) * 100)
      }
      chartData.push(yearData)
    }

    const uniqueLocationNames = uniqueValues(locationNames)

    const parts = []

    for (let i = 0; i < uniqueLocationNames.length; i++) {
      const name = uniqueLocationNames[i]
      const part = {
        type: 'line',
        label: `Till ${name}`,
        dataKey: name,
        color: `var(--chart-${(i % 10) + 1})`,
      }
      parts.push(part)
    }

    const diagram: Diagram = {
      title: `Utflyttar per år från ${filters.location} (procent)`,
      type: 'line',
      axis: {
        x: { label: 'År', dataKey: 'year' },
        y: { label: 'Andel av inflytt (%)' },
      },
      parts,
      chartData,
    }

    return diagram
  }

//Storlek på inflyttade företag per år till ${location} (volym) line chart
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

    const years = uniqueValues(result.map((r) => r.key))
    const chartData: Record<string, string | number>[] = []

    for (const year of years) {
      const yearData = {
        year: year ?? 0,
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

    for (let i = 0; i < uniqueEmployeeRanges.length; i++) {
      const range = uniqueEmployeeRanges[i]
      const part = {
        type: 'line',
        label: `${range} anställda`,
        dataKey: range,
        color: `var(--chart-${(i % 10) + 1})`,
      }
      parts.push(part)
    }

    const diagram: Diagram = {
      title: `Storlek på inflyttade företag per år till ${filters.location} (volym)`,
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

//Storlek på inflyttade företag per år till ${location} (procent) line chart
export const relocationsToByYearByEmployeeRangePercentLineChart: DiagramGenerator =
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

    const years = uniqueValues(result.map((r) => r.key))
    const chartData: Record<string, string | number>[] = []

    for (const year of years) {
      const yearData = {
        year: year ?? 0,
      }

      const filteredRows = result.filter((row) => row.key === year)

      let total = 0
      for (const row of filteredRows) {
        total += row.value
      }

      for (const row of filteredRows) {
        yearData[row.size] = Math.round((row.value / total) * 100)
      }
      chartData.push(yearData)
    }

    const employeeRanges = result.map((r) => r.size)
    const uniqueEmployeeRanges = uniqueValues(employeeRanges)

    const parts = []

    for (let i = 0; i < uniqueEmployeeRanges.length; i++) {
      const range = uniqueEmployeeRanges[i]
      const part = {
        type: 'line',
        label: `${range} anställda`,
        dataKey: range,
        color: `var(--chart-${(i % 10) + 1})`,
      }
      parts.push(part)
    }

    const diagram: Diagram = {
      title: `Storlek på inflyttade företag per år till ${filters.location} (procent)`,
      type: 'line',
      axis: {
        x: { label: 'År', dataKey: 'year' },
        y: { label: 'Andel av inflyttade företag (%)' },
      },
      parts,
      chartData,
    }

    return diagram
  }

//Storlek på utflyttade företag per år från ${location} (volym) line chart
export const relocationsFromByYearByEmployeeRangeVolumeLineChart: DiagramGenerator =
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

    const years = uniqueValues(result.map((r) => r.key))
    const chartData: Record<string, string | number>[] = []

    for (const year of years) {
      const yearData = {
        year: year ?? 0,
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

    for (let i = 0; i < uniqueEmployeeRanges.length; i++) {
      const range = uniqueEmployeeRanges[i]
      const part = {
        type: 'line',
        label: `${range} anställda`,
        dataKey: range,
        color: `var(--chart-${(i % 10) + 1})`,
      }
      parts.push(part)
    }

    const diagram: Diagram = {
      title: `Storlek på utflyttade företag per år från ${filters.location} (volym)`,
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

//Storlek på utflyttade företag per år från ${location} (procent) line chart
export const relocationsFromByYearByEmployeeRangePercentLineChart: DiagramGenerator =
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

    const years = uniqueValues(result.map((r) => r.key))
    const chartData: Record<string, string | number>[] = []

    for (const year of years) {
      const yearData = {
        year: year ?? 0,
      }

      const filteredRows = result.filter((row) => row.key === year)

      let total = 0
      for (const row of filteredRows) {
        total += row.value
      }

      for (const row of filteredRows) {
        yearData[row.size] = Math.round((row.value / total) * 100)
      }
      chartData.push(yearData)
    }

    const employeeRanges = result.map((r) => r.size)
    const uniqueEmployeeRanges = uniqueValues(employeeRanges)

    const parts = []

    for (let i = 0; i < uniqueEmployeeRanges.length; i++) {
      const range = uniqueEmployeeRanges[i]
      const part = {
        type: 'line',
        label: `${range} anställda`,
        dataKey: range,
        color: `var(--chart-${(i % 10) + 1})`,
      }
      parts.push(part)
    }

    const diagram: Diagram = {
      title: `Storlek på utflyttade företag per år från ${filters.location} (procent)`,
      type: 'line',
      axis: {
        x: { label: 'År', dataKey: 'year' },
        y: { label: 'Andel av inflyttade företag (%)' },
      },
      parts,
      chartData,
    }

    return diagram
  }
