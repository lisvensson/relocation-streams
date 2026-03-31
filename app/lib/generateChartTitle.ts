export function generateChartTitle({
  type,
  measure,
  measureCalculation,
  category,
}: {
  type: string | null
  measure: string | null
  measureCalculation?: string | null
  category?: string | null
}) {
  const measureWord = measure === 'inflow' ? 'Inflytt' : 'Utflytt'
  const calculation = measureCalculation === 'percent' ? '(procent)' : '(volym)'
  const categoryLabel =
    category === 'employeeRange'
      ? 'antal anställda'
      : category === 'industryCluster'
        ? 'kluster'
        : category === 'companyType'
          ? 'företagsform'
          : category === 'postalArea'
            ? 'postområde'
            : category === 'municipality'
              ? 'kommun'
              : category === 'county'
                ? 'län'
                : 'kategori'

  if (type === 'temporal') {
    return `${measureWord} över tid ${calculation}`
  }

  if (type === 'category') {
    return `${measureWord} per ${categoryLabel} ${calculation}`
  }

  if (type === 'temporal+category') {
    return `${measureWord} per ${categoryLabel} över tid ${calculation}`
  }

  if (type === 'netflow+category' && category === 'relocationYear') {
    return `Nettoflytt över tid ${calculation}`
  }

  if (type === 'netflow+category') {
    return `Nettoflytt per ${categoryLabel} ${calculation}`
  }

  return 'Diagram saknar titel'
}
