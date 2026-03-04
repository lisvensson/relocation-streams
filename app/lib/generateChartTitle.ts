export function generateChartTitle({
  type,
  measureCalculation,
}: {
  type: string | null
  measureCalculation?: string | null
}) {
  const calculation = measureCalculation === 'percent' ? '(procent)' : '(volym)'

  if (type === 'netflow+category') {
    return `Nettoflytt per kategori ${calculation}`
  }

  if (type === 'temporal') {
    return `Inflytt/Utflytt över tid ${calculation}`
  }

  if (type === 'category') {
    return `Inflytt/Utflytt per kategori ${calculation}`
  }

  if (type === 'temporal+category') {
    return `Inflytt/Utflytt per kategori över tid ${calculation}`
  }

  return 'Diagram saknar titel'
}
