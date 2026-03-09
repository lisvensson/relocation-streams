import { buildCategoryChart } from '../buildCharts/buildCategoryChart.ts'
import type { Filter, CategoryChartConfig } from '../models/chartModels.ts'

const area = 'göteborg'

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

const chartConfig: CategoryChartConfig = {
  title: 'Utveckling per kategori',
  type: 'category',
  description: '',
  measure: 'outflow',
  uiSettings: {
    containerSize: 'medium',
    legendPlacement: 'bottom',
    tablePlacement: 'hidden',
  },
  category: 'municipality',
  maxNumberOfCategories: 5,
  combineRemainingCategories: true,
  excludeSelectedArea: false,
  chartType: 'bar', // pie eller bar
}

async function testBuildCategoryChart() {
  const result = await buildCategoryChart(area, filters, chartConfig)
  console.log(result)
}

testBuildCategoryChart()
