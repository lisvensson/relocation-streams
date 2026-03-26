export type Measure = 'inflow' | 'outflow'

type Category =
  | 'relocationYear'
  | 'employeeRange'
  | 'industryCluster'
  | 'companyType'
  | 'postalArea'
  | 'municipality'
  | 'county'

export type ChartUiSettings = {
  containerSize: '25' | '1/3' | '50' | '2/3' | '75' | '100' // ??
  legendPlacement: 'hidden' | 'top' | 'bottom' /* | 'left' | 'right' */
  tablePlacement: 'hidden' | 'top' | 'bottom' /* | 'left' | 'right' */
}

export type TemporalChartConfig = {
  type: 'temporal'
  title: string
  description: string
  filters?: Filter[]
  uiSettings?: ChartUiSettings
  measure: Measure
}

export type CategoryChartConfig = {
  type: 'category'
  title: string
  description: string
  filters?: Filter[]
  uiSettings?: ChartUiSettings
  measure: Measure
  category: Category
  maxNumberOfCategories: number
  combineRemainingCategories: boolean
  excludeSelectedArea: boolean
  chartType: 'pie' | 'bar'
}

export type TemporalCategoryChartConfig = {
  type: 'temporal+category'
  title: string
  description: string
  filters?: Filter[]
  uiSettings?: ChartUiSettings
  measure: Measure
  category: Category
  maxNumberOfCategories: number
  combineRemainingCategories: boolean
  excludeSelectedArea: boolean
  measureCalculation: 'volume' | 'percent'
}

export type NetFlowCategoryChartConfig = {
  type: 'netflow+category'
  title: string
  description: string
  filters?: Filter[]
  uiSettings?: ChartUiSettings
  category: Category
  maxNumberOfCategories: number
  combineRemainingCategories: boolean
  excludeSelectedArea: boolean
}

export type ChartConfig =
  | TemporalChartConfig
  | CategoryChartConfig
  | TemporalCategoryChartConfig
  | NetFlowCategoryChartConfig

export type ChartModel = {
  id?: string
  type: string
  title: string
  description: string
  chartType: ChartType
  measure?: Measure // ??
  dimension: Dimension | null
  series: string[]
  data: ChartDataPoint[]
  uiSettings?: ChartUiSettings
  measureCalculation?: string
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
