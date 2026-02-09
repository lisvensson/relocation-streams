import type { ChartConfig } from '~/shared/database/models/chartModels'

export function generateChartTitle(
  chartConfig: ChartConfig,
  area: string | undefined
): string {
  const { type, measure, measureCalculation } = chartConfig

  const measureWord = measure === 'inflow' ? 'Inflytt' : 'Utflytt'

  const preposition = measure === 'inflow' ? 'till' : 'från'

  const areaPart = area ? ` ${preposition} ${area}` : ''

  const calculationValue =
    measureCalculation === 'percent'
      ? '(procent)'
      : measureCalculation === 'volume'
        ? '(volym)'
        : '(volym)'

  if (type === 'netflow') {
    return `Nettoflytt per år ${area} ${calculationValue}`
  }

  if (type === 'temporal') {
    return `${measureWord} per år${areaPart} ${calculationValue}`
  }

  if (type === 'category') {
    return `${measureWord} per kategori${areaPart} ${calculationValue}`
  }

  if (type === 'temporal+category') {
    return `${measureWord} per år och kategori${areaPart} ${calculationValue}`
  }

  return 'Diagram saknar titel'
}
