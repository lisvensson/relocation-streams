import { and, arrayContains, count, desc, inArray } from 'drizzle-orm'
import type {
  CategoryChartConfig,
  ChartDataPoint,
  ChartModel,
  Filter,
} from '../models/chartModels.ts'
import { db } from '../index.ts'
import { relocation } from '../schema.ts'
import { generateChartTitle } from '../utils/generateChartTitle.ts'

type buildCategoryChartFunction = (
  area: string | undefined,
  filters: Filter[],
  chartConfig: CategoryChartConfig
) => Promise<ChartModel>

export const buildCategoryChart: buildCategoryChartFunction = async (
  area,
  filters,
  chartConfig
) => {
  console.log({ area, filters, chartConfig })

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
    ...filters.map((f) =>
      f.operator === 'in' ? inArray(relocation[f.key], f.value) : undefined
    ),
    area ? arrayContains(measureValue, [area]) : undefined
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

  const dimensionKey = category

  for (const row of rows) {
    const relocationsData = {
      [dimensionKey]: row.dimension,
      [measure]: row.value,
    }
    data.push(relocationsData)
  }

  return {
    title: generateChartTitle(chartConfig, area),
    type: chartType,
    measure,
    dimension: dimensionKey,
    series: [measure],
    data,
    uiSettings: chartConfig.uiSettings,
  }
}
