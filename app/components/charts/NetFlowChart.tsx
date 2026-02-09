import ChartRenderer from './ChartRenderer'
import type { ChartModel } from '~/shared/database/models/chartModels'

interface NetFlowChartProps {
  data: ChartModel
}

export function NetFlowChart({ data }: NetFlowChartProps) {
  return <ChartRenderer {...data} />
}
