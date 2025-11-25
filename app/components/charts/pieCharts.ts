import { and, arrayContains, count, desc, inArray } from 'drizzle-orm'
import type { Diagram, DiagramGenerator } from '~/models/diagramModels'
import { db } from '~/shared/database'
import { relocation } from '~/shared/database/schema'

//Inflyttar totalt till ${location} (volym) pie chart
export const relocationsToFromLocationTotalVolumePieChart: DiagramGenerator =
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
        fromLocation: relocation.fromMunicipality,
        value: count(),
      })
      .from(relocation)
      .where(where)
      .groupBy(relocation.fromMunicipality)

    result.sort((a, b) => b.value - a.value)
    const topLocations = result.slice(0, 10)

    const chartData: Record<string, string | number>[] = []

    for (const row of topLocations) {
      const relocationsData = {
        fromLocation: `Från ${row.fromLocation}`,
        totalRelocations: row.value,
      }
      chartData.push(relocationsData)
    }

    const diagram: Diagram = {
      title: `Inflyttar totalt till ${filters.location} (volym)`,
      type: 'pie',
      axis: {
        x: { label: 'Från kommun', dataKey: 'fromLocation' },
        y: { label: 'Antal flyttar' },
      },
      parts: [
        {
          type: 'pie',
          dataKey: 'totalRelocations',
          nameKey: 'fromLocation',
          color: [
            '#172554',
            '#1e3a8a',
            '#1e40af',
            '#1d4ed8',
            '#2563eb',
            '#3b82f6',
            '#60a5fa',
            '#93c5fd',
            '#bfdbfe',
            '#dbeafe',
          ],
        },
      ],
      chartData,
    }

    return diagram
  }

//Inflyttar totalt till ${location} (procent) pie chart
export const relocationsToFromLocationTotalPercentPieChart: DiagramGenerator =
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
        fromLocation: relocation.fromMunicipality,
        value: count(),
      })
      .from(relocation)
      .where(where)
      .groupBy(relocation.fromMunicipality)

    result.sort((a, b) => b.value - a.value)
    const topLocations = result.slice(0, 10)

    let total = 0
    for (const row of topLocations) {
      total += row.value
    }

    const chartData: Record<string, string | number>[] = []

    for (const row of topLocations) {
      const relocationsData = {
        fromLocation: `Från ${row.fromLocation}`,
        totalRelocations: Math.round((row.value / total) * 100),
      }
      chartData.push(relocationsData)
    }

    const diagram: Diagram = {
      title: `Inflyttar totalt till ${filters.location} (procent)`,
      type: 'pie',
      axis: {
        x: { label: 'Från kommun', dataKey: 'fromLocation' },
        y: { label: 'Andel av inflytt (%)' },
      },
      parts: [
        {
          type: 'pie',
          dataKey: 'totalRelocations',
          nameKey: 'fromLocation',
          color: [
            '#172554',
            '#1e3a8a',
            '#1e40af',
            '#1d4ed8',
            '#2563eb',
            '#3b82f6',
            '#60a5fa',
            '#93c5fd',
            '#bfdbfe',
            '#dbeafe',
          ],
        },
      ],
      chartData,
    }

    return diagram
  }

//Utflyttar totalt till ${location} (volym) pie chart
export const relocationsFromToLocationTotalVolumePieChart: DiagramGenerator =
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
        toLocation: relocation.toMunicipality,
        value: count(),
      })
      .from(relocation)
      .where(where)
      .groupBy(relocation.toMunicipality)

    result.sort((a, b) => b.value - a.value)
    const topLocations = result.slice(0, 10)

    const chartData: Record<string, string | number>[] = []

    for (const row of topLocations) {
      const relocationsData = {
        toLocation: `Till ${row.toLocation}`,
        totalRelocations: row.value,
      }
      chartData.push(relocationsData)
    }

    const diagram: Diagram = {
      title: `Utflyttar totalt från ${filters.location} (volym)`,
      type: 'pie',
      axis: {
        x: { label: 'Från kommun', dataKey: 'toLocation' },
        y: { label: 'Antal flyttar' },
      },
      parts: [
        {
          type: 'pie',
          dataKey: 'totalRelocations',
          nameKey: 'toLocation',
          color: [
            '#172554',
            '#1e3a8a',
            '#1e40af',
            '#1d4ed8',
            '#2563eb',
            '#3b82f6',
            '#60a5fa',
            '#93c5fd',
            '#bfdbfe',
            '#dbeafe',
          ],
        },
      ],
      chartData,
    }

    return diagram
  }

//Utflyttar totalt till ${location} (procent) pie chart
export const relocationsFromToLocationTotalPercentPieChart: DiagramGenerator =
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
        toLocation: relocation.toMunicipality,
        value: count(),
      })
      .from(relocation)
      .where(where)
      .groupBy(relocation.toMunicipality)

    result.sort((a, b) => b.value - a.value)
    const topLocations = result.slice(0, 10)

    let total = 0
    for (const row of topLocations) {
      total += row.value
    }

    const chartData: Record<string, string | number>[] = []

    for (const row of topLocations) {
      const relocationsData = {
        toLocation: `Till ${row.toLocation}`,
        totalRelocations: Math.round((row.value / total) * 100),
      }
      chartData.push(relocationsData)
    }

    const diagram: Diagram = {
      title: `Utflyttar totalt från ${filters.location} (procent)`,
      type: 'pie',
      axis: {
        x: { label: 'Från kommun', dataKey: 'toLocation' },
        y: { label: 'Andel av utflytt (%)' },
      },
      parts: [
        {
          type: 'pie',
          dataKey: 'totalRelocations',
          nameKey: 'toLocation',
          color: [
            '#172554',
            '#1e3a8a',
            '#1e40af',
            '#1d4ed8',
            '#2563eb',
            '#3b82f6',
            '#60a5fa',
            '#93c5fd',
            '#bfdbfe',
            '#dbeafe',
          ],
        },
      ],
      chartData,
    }

    return diagram
  }

//Inflyttande kluster pie chart
export const relocationsIndustryClusterPieChart: DiagramGenerator = async (
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
    .select({ key: relocation.industryCluster, value: count() })
    .from(relocation)
    .where(where)
    .groupBy(relocation.industryCluster)
    .orderBy(desc(count()))
    .limit(10)

  const chartData: Record<string, string | number>[] = []

  for (const row of result) {
    const relocationsData = {
      industryCluster: row.key ?? 0,
      totalRelocations: row.value ?? 0,
    }
    chartData.push(relocationsData)
  }

  const diagram: Diagram = {
    title: `Inflyttande kluster till ${filters.location} (volym)`,
    type: 'pie',
    axis: {},
    parts: [
      {
        type: 'pie',
        dataKey: 'totalRelocations',
        nameKey: 'industryCluster',
        color: [
          '#172554',
          '#1e3a8a',
          '#1e40af',
          '#1d4ed8',
          '#2563eb',
          '#3b82f6',
          '#60a5fa',
          '#93c5fd',
          '#bfdbfe',
          '#dbeafe',
        ],
      },
    ],
    chartData,
  }

  return diagram
}
