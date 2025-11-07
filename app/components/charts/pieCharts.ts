import { and, arrayContains, count, desc, inArray } from 'drizzle-orm'
import type { Diagram, DiagramGenerator } from '~/models/diagramModels'
import { db } from '~/shared/database'
import { relocation } from '~/shared/database/schema'

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

  const chartData = result.map((r) => ({
    industryCluster: r.key as string,
    relocations: r.value,
  }))

  const diagram: Diagram = {
    title: `Inflyttande kluster till ${filters.location}`,
    type: 'pie',
    axis: {},
    parts: [
      {
        type: 'pie',
        dataKey: 'relocations',
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
