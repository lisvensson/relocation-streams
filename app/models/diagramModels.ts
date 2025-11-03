export type DiagramGenerator = (filters: DiagramFilter) => Promise<Diagram>

export type DiagramFilter = {
  years: number[]
  employeeRange: string[]
  companyTypes: string[]
  industryClusters: string[]
  location: string
}

export type Diagram = {
  title: string
  type: 'composed'
  axis: {
    x: { label: string; dataKey: string }
    y: { label: string }
  }
  parts: DiagramPart[]
  chartData: Record<string, string | number>[]
}

export type DiagramPart =
  | {
      type: 'bar'
      label: string
      dataKey: string
      color: string
    }
  | {
      type: 'diffbar'
      label: string
      dataKey: string
      positiveColor: string
      negativeColor: string
    }
