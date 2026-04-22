import { db } from '~/shared/database'
import { eq } from 'drizzle-orm'
import { charts, reports } from '~/shared/database/schema'
import type { ChartConfig, Filter } from '~/shared/database/models/chartModels'
import { buildChartByType } from './buildChartsByType'

export async function buildSharedReportSnapshot(reportId: string) {
  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))

  if (!report) {
    throw new Error(`Report with id ${reportId} not found`)
  }

  const savedCharts = await db
    .select()
    .from(charts)
    .where(eq(charts.reportId, reportId))
    .orderBy(charts.id)

  const area = report.location ?? undefined
  const filters = (report.filters ?? []) as Filter[]

  const buildCharts = await Promise.all(
    savedCharts.map((chart) =>
      buildChartByType(chart.id, area, filters, chart.config as ChartConfig)
    )
  )

  const snapshot = buildCharts.filter(Boolean)

  return {
    report,
    charts: snapshot,
  }
}
