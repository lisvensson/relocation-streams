import { buildCategoryChart } from '../buildCharts/buildCategoryChart.ts'
import type {
  Filter,
  CategoryChartConfig,
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

const chartConfig: CategoryChartConfig = {
  title: 'Fördelning per kategori',
  type: 'category',
  measure: 'inflow',
  category: 'industryCluster',
  maxNumberOfCategories: 5,
  combineRemainingCategories: true,
  chartType: 'bar',
}

async function testBuildCategoryChart() {
  const result = await buildCategoryChart(area, filters, chartConfig)
  console.log(result)
}

testBuildCategoryChart()
