import { buildNetFlowCategoryChart } from '../buildCharts/buildNetFlowCategoryChart.ts'
import type {
  Filter,
  NetFlowCategoryChartConfig,
} from '../models/chartModels.ts'

const area = 'stockholm'

const filters: Filter[] = [
  {
    key: 'employeeRange',
    operator: 'in',
    value: ['5-9', '10-19', '20-49'],
  },
  {
    key: 'relocationYear',
    operator: 'in',
    value: [2020, 2021, 2022, 2023, 2024],
  },
]

const chartConfig: NetFlowCategoryChartConfig = {
  type: 'netflow+category',
  title: 'Nettoflytt per kategori',
  description: '',
  chartType: 'bar',
  category: 'municipality',
  maxNumberOfCategories: 5,
  combineRemainingCategories: true,
  excludeSelectedArea: true,
  uiSettings: {
    containerSize: '50',
    legendPlacement: 'bottom',
    tablePlacement: 'hidden',
  },
}

async function testBuildNetFlowCategoryChart() {
  const result = await buildNetFlowCategoryChart(area, filters, chartConfig)
  console.log(result)
}

testBuildNetFlowCategoryChart()
