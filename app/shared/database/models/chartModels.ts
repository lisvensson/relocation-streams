export type Measure = 'inflow' | 'outflow'

type Category =
  | 'employeeRange'
  | 'industryCluster'
  | 'companyType'
  | 'postalArea'
  | 'municipality'
  | 'county'

export type ChartUiSettings = {
  containerSize: 'small' | 'medium' | 'large' // ??
  legendPlacement: 'hidden' | 'top' | 'bottom' | 'left' | 'right'
  tablePlacement: 'hidden' | 'top' | 'bottom' | 'left' | 'right'
}

export type TemporalChartConfig = {
  type: 'temporal'
  title: string
  filters?: Filter[]
  uiSettings?: ChartUiSettings
  measure: Measure
}

export type CategoryChartConfig = {
  type: 'category'
  title: string
  filters?: Filter[]
  uiSettings?: ChartUiSettings
  measure: Measure
  category: Category
  maxNumberOfCategories: number
  combineRemainingCategories: boolean
  chartType: 'pie' | 'bar'
}

export type TemporalCategoryChartConfig = {
  type: 'temporal+category'
  title: string
  filters?: Filter[]
  uiSettings?: ChartUiSettings
  measure: Measure
  category: Category
  maxNumberOfCategories: number
  combineRemainingCategories: boolean
  measureCalculation: 'volume' | 'percent'
}

export type NetFlowChartConfig = {
  type: 'netflow'
  title: string
  filters?: Filter[]
}

export type ChartConfig =
  | TemporalChartConfig
  | CategoryChartConfig
  | TemporalCategoryChartConfig
  | NetFlowChartConfig

export type ChartModel = {
  id?: string
  title: string
  type: ChartType
  measure: Measure // ??
  dimension: Dimension
  series: string[]
  data: ChartDataPoint[]
}

export type TemporalDimension = 'year' | 'month' | 'week'
export type Dimension = TemporalDimension | Category
export type ChartType = 'column' | 'bar' | 'pie' | 'line'
export type ChartDataPoint = {
  [key: string]: number | string | null | undefined
}

export type Filter = InArrayFilter /*| EqualsFilter |  | BetweenFilter*/

export type InArrayFilter = {
  key: string
  operator: 'in'
  value: string[] | number[]
}
/*
export type EqualsFilter = {
  key: string;
  operator: "equals";
  value: string;
};

export type BetweenFilter = {
  key: string;
  operator: "between";
  value: [number, number];
};
*/
