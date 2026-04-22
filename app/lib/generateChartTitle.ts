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
  const measureWords: Record<string, string> = {
    inflow: 'Inflytt',
    outflow: 'Utflytt',
    netflow: 'Nettoflytt',
  }

  const categoryLabels: Record<string, string> = {
    employeeRange: 'antal anställda',
    industryCluster: 'kluster',
    companyType: 'företagsform',
    postalArea: 'postområde',
    municipality: 'kommun',
    county: 'län',
  }

  const measureWord = measureWords[measure ?? ''] ?? 'Mätvärde'

  const categoryLabel = categoryLabels[category ?? ''] ?? 'kategori'

  const calculation = measureCalculation === 'percent' ? '(procent)' : '(volym)'

  switch (type) {
    case 'temporal':
      return `${measureWord} över tid ${calculation}`

    case 'category':
      return `${measureWord} per ${categoryLabel} ${calculation}`

    case 'temporal+category':
      return `${measureWord} per ${categoryLabel} över tid ${calculation}`

    case 'netflow+category':
      if (category === 'relocationYear') {
        return `Nettoflytt över tid ${calculation}`
      }
      return `Nettoflytt per ${categoryLabel} ${calculation}`

    default:
      return 'Diagram saknar titel'
  }
}
