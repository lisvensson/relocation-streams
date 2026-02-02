import { buildNetFlowChart } from '../buildCharts/buildNetFlowChart.ts'
import type { Filter, NetFlowChartConfig } from '../models/chartModels.ts'

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
    value: [2021, 2022, 2023, 2024, 2025],
  },
]

const chartConfig: NetFlowChartConfig = {
  type: 'netflow',
  title: 'Nettoflytt per år',
}

async function testBuildNetFlowChart() {
  const result = await buildNetFlowChart(area, filters, chartConfig)
  console.log(result)
}

testBuildNetFlowChart()
