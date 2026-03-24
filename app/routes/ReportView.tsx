import { eq } from 'drizzle-orm'
import { db } from '~/shared/database'
import type { Route } from './+types/ReportView'
import { charts, reports, sharedReports } from '~/shared/database/schema'
import { buildNetFlowCategoryChart } from '~/shared/database/buildCharts/buildNetFlowCategoryChart'
import { buildTemporalChart } from '~/shared/database/buildCharts/buildTemporalChart'
import { buildCategoryChart } from '~/shared/database/buildCharts/buildCategoryChart'
import { buildTemporalCategoryChart } from '~/shared/database/buildCharts/buildTemporalCategoryChart'
import ChartRenderer from '~/components/charts/ChartRenderer'
import { XIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Link } from 'react-router'

export async function loader({ params }: Route.LoaderArgs) {
  const [report] = await db
    .select({
      id: reports.id,
      title: reports.title,
      description: reports.description,
      createdAt: reports.createdAt,
      location: reports.location,
      filters: reports.filters,
      sharedId: sharedReports.id,
    })
    .from(reports)
    .leftJoin(sharedReports, eq(sharedReports.reportId, reports.id))
    .where(eq(reports.id, params.reportId))

  if (!report) {
    throw new Response('Rapporten hittades inte', { status: 404 })
  }

  const location = report.location?.toLowerCase()
  const filters = report.filters

  const savedCharts = await db
    .select()
    .from(charts)
    .where(eq(charts.reportId, params.reportId))
    .orderBy(charts.id)

  const buildCharts = await Promise.all(
    savedCharts.map(async (chart) => {
      const config = chart.config
      if (config.type === 'netflow+category') {
        const buildChart = await buildNetFlowCategoryChart(
          location,
          filters,
          config
        )
        return { id: chart.id, ...buildChart, config }
      }

      if (config.type === 'temporal') {
        const buildChart = await buildTemporalChart(location, filters, config)
        return { id: chart.id, ...buildChart, config }
      }

      if (config.type === 'category') {
        const buildChart = await buildCategoryChart(location, filters, config)
        return { id: chart.id, ...buildChart, config }
      }

      if (config.type === 'temporal+category') {
        const buildChart = await buildTemporalCategoryChart(
          location,
          filters,
          config
        )
        return { id: chart.id, ...buildChart, config }
      }

      return null
    })
  )

  return { report, charts: buildCharts }
}

export default function ReportView({ loaderData }: Route.ComponentProps) {
  const { report, charts } = loaderData

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold">{report.title}</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="transition">
            <Link to={`/rapport/${report.id}`} className="flex items-center">
              <XIcon className="size-4 mr-2" />
              Stäng
            </Link>
          </Button>
        </div>
      </div>

      {report.description && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Beskrivning</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {report.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {charts.map((chart) => (
          <ChartRenderer key={chart.id} {...chart} readOnly={true} />
        ))}
      </div>
    </div>
  )
}
