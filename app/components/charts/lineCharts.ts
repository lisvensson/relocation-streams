import { and, arrayContains, count, inArray, asc, sql } from 'drizzle-orm'
import { entry } from 'virtual:react-router/server-build'
import type {
  Diagram,
  DiagramGenerator,
  DiagramPart,
} from '~/models/diagramModels'
import { db } from '~/shared/database'
import { relocation } from '~/shared/database/schema'

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

    const groupByYear: Record<number, Record<string, number | string>> = {}

    for (const item of result) {
      console.log(item)
      const { key, size, value } = item
      if (key && size != null) {
        if (!groupByYear[key]) {
          groupByYear[key] = { year: key }
        }
        groupByYear[key][size] = value
      }
    }

    const chartData = Object.values(groupByYear)

    const parts = [...new Set(result.map((r) => r.size as string))].map(
      (size, i): DiagramPart => ({
        type: 'line',
        label: size,
        dataKey: size,
        color: `var(--chart-${(i % 10) + 1})`,
      })
    )

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
