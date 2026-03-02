import { and, arrayContains, count, inArray } from 'drizzle-orm'
import type {
  ChartDataPoint,
  ChartModel,
  Filter,
  NetFlowCategoryChartConfig,
} from '../models/chartModels.ts'
import { db } from '../index.ts'
import { relocation } from '../schema.ts'
import { generateChartTitle } from '../utils/generateChartTitle.ts'

type BuildNetFlowCategoryChartFunction = (
  area: string | undefined,
  filters: Filter[],
  chartConfig: NetFlowCategoryChartConfig
) => Promise<ChartModel>

export const buildNetFlowCategoryChart: BuildNetFlowCategoryChartFunction =
  async (area, filters, chartConfig) => {
    console.log({ area, filters, chartConfig })

    const inflowValue = relocation.toLocation
    const outflowValue = relocation.fromLocation

    const { category, maxNumberOfCategories, combineRemainingCategories } =
      chartConfig

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
        dimension: inflowCategoryValue,
        value: count(),
      })
      .from(relocation)
      .where(whereInflow)
      .groupBy(inflowCategoryValue)

    const outflowResult = await db
      .select({
        dimension: outflowCategoryValue,
        value: count(),
      })
      .from(relocation)
      .where(whereOutflow)
      .groupBy(outflowCategoryValue)

    const allCategories = Array.from(
      new Set([
        ...inflowResult.map((r) => r.dimension),
        ...outflowResult.map((r) => r.dimension),
      ])
    )

    let rows = allCategories.map((cat) => {
      const inflow = inflowResult.find((r) => r.dimension === cat)?.value ?? 0
      const outflow = outflowResult.find((r) => r.dimension === cat)?.value ?? 0

      return {
        dimension: cat,
        inflow,
        outflow,
        net: inflow - outflow,
      }
    })

    if (category === 'relocationYear') {
      rows.sort((a, b) => Number(a.dimension) - Number(b.dimension))
    } else {
      rows.sort((a, b) => b.inflow + b.outflow - (a.inflow + a.outflow))
    }

    if (maxNumberOfCategories && rows.length > maxNumberOfCategories) {
      const topResult = rows.slice(0, maxNumberOfCategories)
      const otherResult = rows.slice(maxNumberOfCategories)

      if (combineRemainingCategories) {
        let inflowSum = 0
        let outflowSum = 0
        let netSum = 0

        for (const other of otherResult) {
          inflowSum += other.inflow
          outflowSum += other.outflow
          netSum += other.net
        }

        rows = [
          ...topResult,
          {
            dimension: 'Övrigt',
            inflow: inflowSum,
            outflow: outflowSum,
            net: netSum,
          },
        ]
      } else {
        rows = topResult
      }
    }

    const data: ChartDataPoint[] = []
    const dimensionKey = category

    for (const row of rows) {
      const relocationsData = {
        [dimensionKey]: row.dimension,
        inflow: row.inflow,
        outflow: row.outflow,
        net: row.net,
      }
      data.push(relocationsData)
    }

    return {
      type: chartConfig.type,
      title: generateChartTitle(chartConfig, area),
      chartType: 'column',
      measure: 'inflow',
      dimension: dimensionKey,
      series: ['inflow', 'outflow', 'net'],
      data,
      uiSettings: chartConfig.uiSettings,
    }
  }
