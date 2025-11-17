import { and, arrayContains, count, inArray, asc, sql, desc } from 'drizzle-orm'
import type { Diagram, DiagramGenerator } from '~/models/diagramModels'
import { db } from '~/shared/database'
import { relocation } from '~/shared/database/schema'

//Flyttar per år till location bar chart
export const relocationsToByYearBarChart: DiagramGenerator = async (
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
    title: `Flyttar per år till ${filters.location}`,
    type: 'bar',
    axis: {
      x: { label: 'År', dataKey: 'year' },
      y: { label: 'Antal flyttar' },
    },
    parts: [
      {
        type: 'bar',
        label: `Till ${filters.location}`,
        dataKey: 'totalRelocations',
        color: 'var(--chart-1)',
      },
    ],
    chartData,
  }
  return diagram
}

//Flyttar per år från location bar chart
export const relocationsFromByYearBarChart: DiagramGenerator = async (
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
    title: `Flyttar per år från ${filters.location}`,
    type: 'bar',
    axis: {
      x: { label: 'År', dataKey: 'year' },
      y: { label: 'Antal flyttar' },
    },
    parts: [
      {
        type: 'bar',
        label: `Från ${filters.location}`,
        dataKey: 'totalRelocations',
        color: 'var(--chart-1)',
      },
    ],
    chartData,
  }

  return diagram
}

//Nettoflyttar per år bar chart
export const netMovesByYearBarChart: DiagramGenerator = async (filters) => {
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
    const toCount = resultTo.find((row) => row.key === year)?.value ?? 0
    const fromCount = resultFrom.find((row) => row.key === year)?.value ?? 0
    const yearData = {
      year: year ?? 0,
      toCount,
      fromCount,
      diffCount: toCount - fromCount,
    }
    chartData.push(yearData)
  }

  const diagram: Diagram = {
    title: `Nettoflyttar per år ${filters.location}`,
    type: 'bar',
    axis: {
      x: { label: 'År', dataKey: 'year' },
      y: { label: 'Antal flyttar' },
    },
    parts: [
      {
        type: 'bar',
        dataKey: 'toCount',
        label: `Till ${filters.location}`,
        color: 'var(--chart-1)',
      },
      {
        type: 'bar',
        dataKey: 'fromCount',
        label: `Från ${filters.location}`,
        color: 'var(--chart-11)',
      },
      {
        type: 'diffbar',
        dataKey: 'diffCount',
        label: `Diff ${filters.location}`,
        positiveColor: 'green',
        negativeColor: 'red',
      },
    ],
    chartData,
  }

  return diagram
}

//Nettoflyttar totalt bar chart
export const netMovesTotalBarChart: DiagramGenerator = async (filters) => {
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
    .select({ value: count() })
    .from(relocation)
    .where(whereTo)

  const resultFrom = await db
    .select({ value: count() })
    .from(relocation)
    .where(whereFrom)

  const chartData: Record<string, string | number>[] = []
  const toCount = resultTo[0]?.value ?? 0
  const fromCount = resultFrom[0]?.value ?? 0

  const relocationsData = {
    location: filters.location,
    toCount,
    fromCount,
    diffCount: toCount - fromCount,
  }

  chartData.push(relocationsData)

  const diagram: Diagram = {
    title: `Nettoflyttar totalt ${filters.location}`,
    type: 'bar',
    axis: {
      x: { label: 'Plats', dataKey: 'location' },
      y: { label: 'Antal flyttar' },
    },
    parts: [
      {
        type: 'bar',
        dataKey: 'toCount',
        label: `Till ${filters.location}`,
        color: 'var(--chart-1)',
      },
      {
        type: 'bar',
        dataKey: 'fromCount',
        label: `Från ${filters.location}`,
        color: 'var(--chart-11)',
      },
      {
        type: 'diffbar',
        dataKey: 'diffCount',
        label: `Diff ${filters.location}`,
        positiveColor: 'green',
        negativeColor: 'red',
      },
    ],
    chartData,
  }

  return diagram
}

//Storlek på inflyttade bolag bar chart
export const relocationsEmployeeRangeBarChart: DiagramGenerator = async (
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
    .select({ key: relocation.employeeRange, value: count() })
    .from(relocation)
    .where(where)
    .groupBy(relocation.employeeRange)
    .orderBy(
      asc(sql`CAST(SPLIT_PART(${relocation.employeeRange}, '-', 1) AS INTEGER)`)
    )

  const chartData: Record<string, string | number>[] = []

  for (const row of result) {
    const relocationsData = {
      employeeRange: row.key ?? 0,
      totalRelocations: row.value ?? 0,
    }
    chartData.push(relocationsData)
  }

  const diagram: Diagram = {
    title: `Storlek på inflyttade företag till ${filters.location}`,
    type: 'bar',
    axis: {
      x: { label: 'Antal anställda', dataKey: 'employeeRange' },
      y: { label: 'Antal flyttar' },
    },
    parts: [
      {
        type: 'bar',
        label: `Till ${filters.location}`,
        dataKey: 'totalRelocations',
        color: 'var(--chart-1)',
      },
    ],
    chartData,
  }

  return diagram
}

//Inflyttande kluster bar chart
export const relocationsIndustryClusterBarChart: DiagramGenerator = async (
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

  const chartData: Record<string, string | number>[] = []

  for (const row of result) {
    const relocationsData = {
      industryCluster: row.key ?? 0,
      totalRelocations: row.value ?? 0,
    }
    chartData.push(relocationsData)
  }

  const diagram: Diagram = {
    title: `Inflyttande kluster till ${filters.location}`,
    type: 'barBig',
    axis: {
      x: { label: 'Industrikluster', dataKey: 'industryCluster' },
      y: { label: 'Antal flyttar' },
    },
    parts: [
      {
        type: 'bar',
        label: `Till ${filters.location}`,
        dataKey: 'totalRelocations',
        color: 'var(--chart-1)',
      },
    ],
    chartData,
  }

  return diagram
}
