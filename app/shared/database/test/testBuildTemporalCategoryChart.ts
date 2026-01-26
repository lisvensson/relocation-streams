import { buildTemporalCategoryChart } from '../buildCharts/buildTemporalCategoryChart.ts'
import type {
  Filter,
  TemporalCategoryChartConfig,
} from '../../../models/chartModels.ts'

const area = 'stockholm'

const filters: Filter[] = [
  {
    key: 'relocationYear',
    operator: 'in',
    value: [2021, 2022, 2023, 2024, 2025],
  },
  {
    key: 'employeeRange',
    operator: 'in',
    value: ['5-9', '10-19', '20-49'],
  },
]

const chartConfig: TemporalCategoryChartConfig = {
  type: 'temporal+category',
  title: 'Flyttar per år och kategori',
  measure: 'outflow',
  category: 'municipality',
  maxNumberOfCategories: 10,
  combineRemainingCategories: false,
  measureCalculation: 'percent',
}

async function testBuildTemporalCategoryChart() {
  const result = await buildTemporalCategoryChart(area, filters, chartConfig)
  console.log(result)
}

testBuildTemporalCategoryChart()
