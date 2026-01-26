import { buildTemporalChart } from '../buildCharts/buildTemporalChart.ts'
import type {
  Filter,
  TemporalChartConfig,
} from '../../../models/chartModels.ts'

const area = 'eskilstuna'

const filters: Filter[] = [
  {
    key: 'employeeRange',
    operator: 'in',
    value: ['5-9', '10-19', '20-49'],
  },
  {
    key: 'relocationYear',
    operator: 'in',
    value: [2021, 2022, 2023, 2024, 2025],
  },
]

const chartConfig: TemporalChartConfig = {
  title: 'Utflytt per år',
  type: 'temporal',
  measure: 'outflow',
  filters,
  uiSettings: {
    containerSize: 'medium',
    legendPlacement: 'bottom',
    tablePlacement: 'hidden',
  },
}

async function testBuildTemporalChart() {
  const result = await buildTemporalChart(area, filters, chartConfig)
  console.log(result)
}

testBuildTemporalChart()
