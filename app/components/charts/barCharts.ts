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

  const chartData = result.map((r) => {
    return {
      year: r.key as number,
      relocations: r.value,
    }
  })

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
        dataKey: 'relocations',
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

  const chartData = result.map((r) => {
    return {
      year: r.key as number,
      relocations: r.value,
    }
  })

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
        dataKey: 'relocations',
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
      diffCount: toCount - fromCount,
    }
  })

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
        color: 'var(--chart-2)',
      },
      {
        type: 'bar',
        dataKey: 'fromCount',
        label: `Från ${filters.location}`,
        color: 'var(--chart-1)',
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
    .select({ valueTo: count() })
    .from(relocation)
    .where(whereTo)

  const resultFrom = await db
    .select({ valueFrom: count() })
    .from(relocation)
    .where(whereFrom)

  const toCount = resultTo[0]?.valueTo ?? 0
  const fromCount = resultFrom[0]?.valueFrom ?? 0
  const diffCount = toCount - fromCount

  const chartData =
    toCount === 0 && fromCount === 0
      ? []
      : [
          {
            location: filters.location,
            toCount,
            fromCount,
            diffCount,
          },
        ]

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
        color: 'var(--chart-2)',
      },
      {
        type: 'bar',
        dataKey: 'fromCount',
        label: `Från ${filters.location}`,
        color: 'var(--chart-1)',
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

  const chartData = result.map((r) => {
    return {
      employeeRange: r.key as string,
      relocations: r.value,
    }
  })

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
        dataKey: 'relocations',
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

  const chartData = result.map((r) => {
    return {
      industryCluster: r.key as string,
      relocations: r.value,
    }
  })

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
        dataKey: 'relocations',
        color: 'var(--chart-1)',
      },
    ],
    chartData,
  }

  return diagram
}
