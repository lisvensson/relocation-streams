export function generateExampleChartTitle({
  type,
  measure,
  measureCalculation,
}: {
  type: string | null
  measure: string | null
  measureCalculation?: string | null
}) {
  const measureWord = measure === 'inflow' ? 'Inflytt' : 'Utflytt'
  const calculation = measureCalculation === 'percent' ? '(procent)' : '(volym)'

  if (type === 'temporal') {
    return `Exempel: ${measureWord} över tid ${calculation}`
  }

  if (type === 'category') {
    return `Exempel: ${measureWord} per kategori ${calculation}`
  }

  if (type === 'temporal+category') {
    return `Exempel: ${measureWord} per kategori över tid ${calculation}`
  }

  if (type === 'netflow+category') {
    return `Exempel: Nettoflytt per kategori ${calculation}`
  }

  return 'Diagram saknar titel'
}
