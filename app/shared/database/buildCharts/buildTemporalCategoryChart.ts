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

    const inflowValue = relocation.toLocation
    const outflowValue = relocation.fromLocation

    let inflowCategoryValue
    let outflowCategoryValue

    if (category === 'postalArea') {
      inflowCategoryValue = relocation.fromPostalArea
      outflowCategoryValue = relocation.toPostalArea
    } else if (category === 'municipality') {
      inflowCategoryValue = relocation.fromMunicipality
      outflowCategoryValue = relocation.toMunicipality
    } else if (category === 'county') {
      inflowCategoryValue = relocation.fromCounty
      outflowCategoryValue = relocation.toCounty
    } else {
      inflowCategoryValue = relocation[category]
      outflowCategoryValue = relocation[category]
    }

    let result: {
      year: number
      category: string
      value: number
    }[] = []

    if (measure === 'netflow') {
      const whereInflow = and(
        ...filters.map((f) =>
          f.operator === 'in' ? inArray(relocation[f.key], f.value) : undefined
        ),
        area ? arrayContains(inflowValue, [area]) : undefined
      )

      const whereOutflow = and(
        ...filters.map((f) =>
          f.operator === 'in' ? inArray(relocation[f.key], f.value) : undefined
        ),
        area ? arrayContains(outflowValue, [area]) : undefined
      )

      const inflowResult = await db
        .select({
          year: relocation.relocationYear,
          category: inflowCategoryValue,
          value: count(),
        })
        .from(relocation)
        .where(whereInflow)
        .groupBy(relocation.relocationYear, inflowCategoryValue)

      const outflowResult = await db
        .select({
          year: relocation.relocationYear,
          category: outflowCategoryValue,
          value: count(),
        })
        .from(relocation)
        .where(whereOutflow)
        .groupBy(relocation.relocationYear, outflowCategoryValue)

      const keysInflow = inflowResult.map((r) => `${r.year}+${r.category}`)
      const keysOutflow = outflowResult.map((r) => `${r.year}+${r.category}`)

      const allKeys = Array.from(new Set([...keysInflow, ...keysOutflow]))

      result = allKeys.map((key) => {
        const [years, categories] = key.split('+')
        const year = Number(years)
        const category = String(categories)

        const inflow =
          inflowResult.find((r) => `${r.year}+${r.category}` === key)?.value ??
          0
        const outflow =
          outflowResult.find((r) => `${r.year}+${r.category}` === key)?.value ??
          0

        return {
          year,
          category,
          value: inflow - outflow,
        }
      })
    }

    if (measure !== 'netflow') {
      const measureValue = {
        inflow: relocation.toLocation,
        outflow: relocation.fromLocation,
        netflow: null,
      }[measure]

      const categoryValue =
        measure === 'inflow' ? inflowCategoryValue : outflowCategoryValue

      const where = and(
        ...filters.map((f) =>
          f.operator === 'in' ? inArray(relocation[f.key], f.value) : undefined
        ),
        area ? arrayContains(measureValue!, [area]) : undefined
      )

      result = (
        await db
          .select({
            year: relocation.relocationYear,
            category: categoryValue,
            value: count(),
          })
          .from(relocation)
          .where(where)
          .groupBy(relocation.relocationYear, categoryValue)
          .orderBy(asc(relocation.relocationYear))
      ).map((r) => ({
        year: r.year ?? 0,
        category: String(r.category ?? ''),
        value: r.value,
      }))
    }

    if (excludeSelectedArea && area) {
      result = result.filter((row) => row.category !== area)
    }

    const totalsByCategory: Record<string, number> = {}

    for (const row of result) {
      if (measure === 'inflow' || measure === 'outflow') {
        totalsByCategory[row.category] =
          (totalsByCategory[row.category] ?? 0) + Number(row.value)
      }

      if (measure === 'netflow') {
        const absoluteNetValue = Math.abs(row.value)
        totalsByCategory[row.category] =
          (totalsByCategory[row.category] ?? 0) + Number(absoluteNetValue)
      }
    }

    const sortedCategories = Object.keys(totalsByCategory).sort(
      (a, b) => totalsByCategory[b] - totalsByCategory[a]
    )
    const topCategories = sortedCategories.slice(0, maxNumberOfCategories)

    const years = Array.from(new Set(result.map((r) => r.year)))
    const data: ChartDataPoint[] = []
    const dimensionKey = 'year'
    for (const year of years) {
      const point: ChartDataPoint = { [dimensionKey]: String(year) }
      let otherSum = 0

      for (const category of topCategories) {
        point[category] = 0
      }

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
