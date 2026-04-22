import { buildCategoryChart } from '~/shared/database/buildCharts/buildCategoryChart'
import { buildNetFlowCategoryChart } from '~/shared/database/buildCharts/buildNetFlowCategoryChart'
import { buildTemporalCategoryChart } from '~/shared/database/buildCharts/buildTemporalCategoryChart'
import { buildTemporalChart } from '~/shared/database/buildCharts/buildTemporalChart'
import type { ChartConfig, Filter } from '~/shared/database/models/chartModels'

export const chartBuilders: Record<string, Function> = {
  'netflow+category': buildNetFlowCategoryChart,
  temporal: buildTemporalChart,
  category: buildCategoryChart,
  'temporal+category': buildTemporalCategoryChart,
}

export async function buildChartByType(
  chartId: string,
  location: string | undefined,
  filters: Filter[],
  config: ChartConfig
) {
  const builder = chartBuilders[config.type]

  if (!builder) {
    console.warn(`Unknown chart type: ${config.type}`)
    return { id: chartId, error: true, message: 'Okänd diagramtyp', config }
  }

  try {
    const built = await builder(location, filters, config)
    return { id: chartId, ...built, config }
  } catch (error) {
    console.error(`Failed to build chart ${chartId}:`, error)
    return {
      id: chartId,
      error: true,
      message: `Kunde inte bygga diagram: ${String(error)}`,
      config,
    }
  }
}
