import { inArray, and, asc, count, arrayContains } from 'drizzle-orm'
import type {
  Filter,
  TemporalChartConfig,
  ChartModel,
  ChartDataPoint,
} from '../models/chartModels.ts'
import { db } from '../index.ts'
import { relocation } from '../schema.ts'
import { generateChartTitle } from '../utils/generateChartTitle.ts'

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

  const dimensionKey = 'year'

  for (const row of result) {
    const relocationsData = {
      [dimensionKey]: String(row.year),
      [measure]: Number(row.value),
    }
    data.push(relocationsData)
  }

  return {
    title: generateChartTitle(chartConfig, area),
    type: 'column',
    measure,
    dimension: dimensionKey,
    series: [measure],
    data,
  }
}
