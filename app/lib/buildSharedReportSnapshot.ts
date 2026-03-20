import { db } from '~/shared/database'
import { eq } from 'drizzle-orm'
import { charts, reports } from '~/shared/database/schema'
import { buildNetFlowCategoryChart } from '~/shared/database/buildCharts/buildNetFlowCategoryChart'
import { buildTemporalChart } from '~/shared/database/buildCharts/buildTemporalChart'
import { buildCategoryChart } from '~/shared/database/buildCharts/buildCategoryChart'
import { buildTemporalCategoryChart } from '~/shared/database/buildCharts/buildTemporalCategoryChart'

export async function buildSharedReportSnapshot(reportId: string) {
  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))

  const savedCharts = await db
    .select()
    .from(charts)
    .where(eq(charts.reportId, reportId))
    .orderBy(charts.id)

  const buildCharts = await Promise.all(
    savedCharts.map(async (chart) => {
      const config = chart.config

      if (config.type === 'netflow+category') {
        return {
          id: chart.id,
          ...(await buildNetFlowCategoryChart(
            report.location?.toLowerCase(),
            report.filters,
            config
          )),
          config,
        }
      }

      if (config.type === 'temporal') {
        return {
          id: chart.id,
          ...(await buildTemporalChart(
            report.location?.toLowerCase(),
            report.filters,
            config
          )),
          config,
        }
      }

      if (config.type === 'category') {
        return {
          id: chart.id,
          ...(await buildCategoryChart(
            report.location?.toLowerCase(),
            report.filters,
            config
          )),
          config,
        }
      }

      if (config.type === 'temporal+category') {
        return {
          id: chart.id,
          ...(await buildTemporalCategoryChart(
            report.location?.toLowerCase(),
            report.filters,
            config
          )),
          config,
        }
      }

      return null
    })
  )

  return { report, charts: buildCharts }
}
