import { and, asc, arrayContains, count, inArray } from 'drizzle-orm'
import type {
  ChartDataPoint,
  ChartModel,
  Filter,
  NetFlowChartConfig,
} from '../models/chartModels.ts'
import { db } from '../index.ts'
import { relocation } from '../schema.ts'
import { generateChartTitle } from '../utils/generateChartTitle.ts'

type BuildNetFlowChartFunction = (
  area: string,
  filters: Filter[],
  chartConfig: NetFlowChartConfig
) => Promise<ChartModel>

export const buildNetFlowChart: BuildNetFlowChartFunction = async (
  area,
  filters,
  chartConfig
) => {
  console.log({ area, filters, chartConfig })

  const inflowValue = relocation.toLocation
  const outflowValue = relocation.fromLocation

  const whereInflow = and(
    ...filters.map((f) => {
      if (f.operator === 'in') {
        return inArray(relocation[f.key], f.value)
      }
      return undefined
    }),
    arrayContains(inflowValue, [area])
  )

  const whereOutflow = and(
    ...filters.map((f) => {
      if (f.operator === 'in') {
        return inArray(relocation[f.key], f.value)
      }
      return undefined
    }),
    arrayContains(outflowValue, [area])
  )

  const inflowResult = await db
    .select({
      dimension: relocation.relocationYear,
      value: count(),
    })
    .from(relocation)
    .where(whereInflow)
    .groupBy(relocation.relocationYear)
    .orderBy(asc(relocation.relocationYear))

  const outflowResult = await db
    .select({
      dimension: relocation.relocationYear,
      value: count(),
    })
    .from(relocation)
    .where(whereOutflow)
    .groupBy(relocation.relocationYear)
    .orderBy(asc(relocation.relocationYear))

  const yearsTo = inflowResult.map((r) => r.dimension)
  const yearsFrom = inflowResult.map((r) => r.dimension)

  const data: ChartDataPoint[] = []

  const dimensionKey = 'year'

  for (const year of yearsTo && yearsFrom) {
    const inflow = inflowResult.find((r) => r.dimension === year)?.value ?? 0
    const outflow = outflowResult.find((r) => r.dimension === year)?.value ?? 0
    const relocationsData = {
      [dimensionKey]: String(year),
      inflow,
      outflow,
      net: inflow - outflow,
    }
    data.push(relocationsData)
  }

  return {
    title: generateChartTitle(chartConfig, area),
    type: 'column',
    measure: 'inflow',
    dimension: 'year',
    series: ['inflow', 'outflow', 'net'],
    data,
  }
}
