import { and, arrayContains, count, desc, inArray } from 'drizzle-orm'
import type {
  CategoryChartConfig,
  ChartDataPoint,
  ChartModel,
  Filter,
} from '../../models/chartModels.ts'
import { db } from '../../shared/database/index.ts'
import { relocation } from '../../shared/database/schema.ts'

type buildCategoryChartFunction = (
  area: string,
  filters: Filter[],
  chartConfig: CategoryChartConfig
) => Promise<ChartModel>

export const buildCategoryChart: buildCategoryChartFunction = async (
  area,
  filters,
  chartConfig
) => {
  console.log(area, filters, chartConfig)

  const {
    measure,
    category,
    maxNumberOfCategories,
    combineRemainingCategories,
    chartType,
  } = chartConfig

  const measureValue = {
    inflow: relocation.toLocation,
    outflow: relocation.fromLocation,
  }[measure]

  const categoryValue = relocation[category]

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
      dimension: categoryValue,
      value: count(),
    })
    .from(relocation)
    .where(where)
    .groupBy(categoryValue)
    .orderBy(desc(count()))

  let rows = result
  if (maxNumberOfCategories && result.length > maxNumberOfCategories) {
    const topResult = result.slice(0, maxNumberOfCategories)
    const otherResult = result.slice(maxNumberOfCategories)

    if (combineRemainingCategories) {
      let otherResultSum = 0

      for (const other of otherResult) {
        otherResultSum += Number(other.value)
      }

      rows = [...topResult, { dimension: 'Övrigt', value: otherResultSum }]
    } else {
      rows = topResult
    }
  }

  const data: ChartDataPoint[] = []

  for (const row of rows) {
    const relocationsData = {
      dimension: row.dimension,
      [measure]: row.value,
    }
    data.push(relocationsData)
  }

  return {
    title: chartConfig.title,
    type: chartType,
    measure,
    dimension: category,
    series: [measure],
    data,
  }
}
