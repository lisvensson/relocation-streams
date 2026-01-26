import { and, arrayContains, count, inArray, asc } from 'drizzle-orm'
import type {
  ChartDataPoint,
  ChartModel,
  Filter,
  TemporalCategoryChartConfig,
} from '../../../models/chartModels.ts'
import { db } from '../index.ts'
import { relocation } from '../schema.ts'

type BuildTemporalCategoryChartFunction = (
  area: string,
  filters: Filter[],
  chartConfig: TemporalCategoryChartConfig
) => Promise<ChartModel>

export const buildTemporalCategoryChart: BuildTemporalCategoryChartFunction =
  async (area, filters, chartConfig) => {
    console.log(area, filters, chartConfig)

    const {
      measure,
      category,
      maxNumberOfCategories,
      combineRemainingCategories,
      measureCalculation,
    } = chartConfig

    const measureValue = {
      inflow: relocation.toLocation,
      outflow: relocation.fromLocation,
    }[measure]

    let categoryValue

    if (category === 'postalArea') {
      categoryValue =
        measure === 'inflow'
          ? relocation.fromPostalArea
          : relocation.toPostalArea
    } else if (category === 'municipality') {
      categoryValue =
        measure === 'inflow'
          ? relocation.fromMunicipality
          : relocation.toMunicipality
    } else if (category === 'county') {
      categoryValue =
        measure === 'inflow' ? relocation.fromCounty : relocation.toCounty
    } else {
      categoryValue = relocation[category]
    }

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
        category: categoryValue,
        value: count(),
      })
      .from(relocation)
      .where(where)
      .groupBy(relocation.relocationYear, categoryValue)
      .orderBy(asc(relocation.relocationYear))

    const totalsByCategory: Record<string, number> = {}
    for (const row of result) {
      totalsByCategory[row.category] =
        (totalsByCategory[row.category] ?? 0) + Number(row.value)
    }

    const sortedCategories = Object.keys(totalsByCategory).sort(
      (a, b) => totalsByCategory[b] - totalsByCategory[a]
    )
    const topCategories = sortedCategories.slice(0, maxNumberOfCategories)

    const years = Array.from(new Set(result.map((r) => r.year)))

    const data: ChartDataPoint[] = []

    for (const year of years) {
      const point: ChartDataPoint = { dimension: String(year) }
      let otherSum = 0

      for (const row of result) {
        if (row.year === year) {
          if (topCategories.includes(row.category)) {
            point[row.category] = Number(row.value)
          } else {
            otherSum += Number(row.value)
          }
        }
      }

      if (combineRemainingCategories) {
        point['Övrigt'] = otherSum
      }

      data.push(point)
    }

    if (measureCalculation === 'percent') {
      for (const point of data) {
        let total = 0

        for (const key in point) {
          if (key !== 'dimension') {
            total += Number(point[key])
          }
        }

        for (const key in point) {
          if (key !== 'dimension') {
            point[key] = total === 0 ? 0 : (Number(point[key]) / total) * 100
          }
        }
      }
    }

    const series = combineRemainingCategories
      ? [...topCategories, 'Övrigt']
      : topCategories

    return {
      title: chartConfig.title,
      type: 'line',
      measure,
      dimension: 'year',
      series,
      data,
    }
  }
