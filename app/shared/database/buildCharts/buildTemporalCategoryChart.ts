import { and, arrayContains, count, inArray, asc } from 'drizzle-orm'
import type {
  ChartDataPoint,
  ChartModel,
  Filter,
  TemporalCategoryChartConfig,
} from '../models/chartModels.ts'
import { db } from '../index.ts'
import { relocation } from '../schema.ts'

type BuildTemporalCategoryChartFunction = (
  area: string | undefined,
  filters: Filter[],
  chartConfig: TemporalCategoryChartConfig
) => Promise<ChartModel>

export const buildTemporalCategoryChart: BuildTemporalCategoryChartFunction =
  async (area, filters, chartConfig) => {
    console.log({ area, filters, chartConfig })

    const {
      measure,
      category,
      maxNumberOfCategories,
      combineRemainingCategories,
      measureCalculation,
      excludeSelectedArea,
    } = chartConfig

    if (!measure || !category || !measureCalculation) {
      return {
        type: chartConfig.type,
        title: chartConfig.title,
        description: chartConfig.description,
        chartType: 'line',
        measure,
        dimension: null,
        series: [],
        data: [],
        uiSettings: chartConfig.uiSettings,
        measureCalculation,
      }
    }

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
      ...filters.map((f) =>
        f.operator === 'in' ? inArray(relocation[f.key], f.value) : undefined
      ),
      area ? arrayContains(measureValue, [area]) : undefined
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

    let filteredResult = result
    if (excludeSelectedArea && area) {
      filteredResult = result.filter((row) => row.category !== area)
    }

    const totalsByCategory: Record<string, number> = {}
    for (const row of filteredResult) {
      totalsByCategory[row.category] =
        (totalsByCategory[row.category] ?? 0) + Number(row.value)
    }

    const sortedCategories = Object.keys(totalsByCategory).sort(
      (a, b) => totalsByCategory[b] - totalsByCategory[a]
    )
    const topCategories = sortedCategories.slice(0, maxNumberOfCategories)

    const years = Array.from(new Set(filteredResult.map((r) => r.year)))

    const data: ChartDataPoint[] = []
    const dimensionKey = 'year'
    for (const year of years) {
      const point: ChartDataPoint = { [dimensionKey]: String(year) }
      let otherSum = 0

      for (const category of topCategories) {
        point[category] = 0
      }

      for (const row of filteredResult) {
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
          if (key !== dimensionKey) {
            total += Number(point[key])
          }
        }

        for (const key in point) {
          if (key !== dimensionKey) {
            point[key] =
              total === 0 ? 0 : Math.round((Number(point[key]) / total) * 100)
          }
        }
      }
    }

    const series = combineRemainingCategories
      ? [...topCategories, 'Övrigt']
      : topCategories

    return {
      type: chartConfig.type,
      title: chartConfig.title,
      description: chartConfig.description,
      chartType: 'line',
      measure,
      dimension: dimensionKey,
      series,
      data,
      uiSettings: chartConfig.uiSettings,
      measureCalculation: chartConfig.measureCalculation,
    }
  }
