import { inArray, and, asc, count, arrayContains } from 'drizzle-orm'
import type {
  Filter,
  TemporalChartConfig,
  ChartModel,
  ChartDataPoint,
} from '../../models/chartModels.ts'
import { db } from '../../shared/database/index.ts'
import { relocation } from '../../shared/database/schema.ts'

type BuildTemporalChartFunction = (
  area: string,
  filters: Filter[],
  chartConfig: TemporalChartConfig
) => Promise<ChartModel>

export const buildTemporalChart: BuildTemporalChartFunction = async (
  area,
  filters,
  chartConfig
) => {
  console.log({ area, filters, chartConfig })

  const { measure } = chartConfig

  const measureValue = {
    inflow: relocation.toLocation,
    outflow: relocation.fromLocation,
  }[measure]

  const where = and(
    ...filters.map((f) => {
      if (f.operator === 'in') {
        return inArray(relocation[f.key], f.value)
      }
      return undefined
    }),
    arrayContains(measureValue, [area])
  )

  const result = await db
    .select({
      year: relocation.relocationYear,
      value: count(),
    })
    .from(relocation)
    .where(where)
    .groupBy(relocation.relocationYear)
    .orderBy(asc(relocation.relocationYear))

  const data: ChartDataPoint[] = []

  for (const row of result) {
    const relocationsData = {
      dimension: String(row.year),
      [measure]: Number(row.value),
    }
    data.push(relocationsData)
  }

  return {
    title: chartConfig.title,
    type: 'column',
    measure,
    dimension: 'year',
    series: [measure],
    data,
  }
}
