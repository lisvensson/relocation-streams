import { eq } from 'drizzle-orm'
import { db } from '~/shared/database'
import type { Route } from './+types/ReportView'
import { charts, reports } from '~/shared/database/schema'
import { buildNetFlowChart } from '~/shared/database/buildCharts/buildNetFlowChart'
import { buildTemporalChart } from '~/shared/database/buildCharts/buildTemporalChart'
import { buildCategoryChart } from '~/shared/database/buildCharts/buildCategoryChart'
import { buildTemporalCategoryChart } from '~/shared/database/buildCharts/buildTemporalCategoryChart'
import ChartRenderer from '~/components/charts/ChartRenderer'
import { XIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Link } from 'react-router'

export async function loader({ params }: Route.LoaderArgs) {
  const [report] = await db
    .select()
    .from(reports)
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
      if (config.type === 'netflow') {
        const buildChart = await buildNetFlowChart(location, filters, config)
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
    <div className="space-y-10">
      <div className="pb-4 border-b flex items-center justify-between">
        <h1 className="text-2xl font-bold">{report.title}</h1>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-destructive transition"
        >
          <Link to="/rapporter">
            <XIcon className="size-5" />
          </Link>
        </Button>
      </div>

      <div className="space-y-12">
        {charts.map((chart) => (
          <ChartRenderer key={chart.id} {...chart} readOnly={true} />
        ))}
      </div>
    </div>
  )
}
