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
    value: [],
  },
]

const chartConfig: NetFlowCategoryChartConfig = {
  type: 'netflow+category',
  title: 'Nettoflytt per kategori',
  description: '',
  category: 'relocationYear',
  maxNumberOfCategories: 0,
  combineRemainingCategories: true,
}

async function testBuildNetFlowCategoryChart() {
  const result = await buildNetFlowCategoryChart(area, filters, chartConfig)
  console.log(result)
}

testBuildNetFlowCategoryChart()
