import { eq } from 'drizzle-orm'
import { db } from '~/shared/database'
import type { Route } from './+types/ReportView'
import { charts, reports, sharedReports } from '~/shared/database/schema'
import ChartRenderer from '~/components/charts/ChartRenderer'
import { XIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Link } from 'react-router'
import { buildChartByType } from '~/lib/buildChartsByType'
import type { ChartConfig, Filter } from '~/shared/database/models/chartModels'

export async function loader({ params }: Route.LoaderArgs) {
  const reportId = params.reportId
  if (!reportId) {
    throw new Response('Ogiltig rapportlänk.', { status: 400 })
  }

  try {
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
      .where(eq(reports.id, reportId))

    if (!report) {
      throw new Response('Rapporten hittades inte.', { status: 404 })
    }

    const savedCharts = await db
      .select()
      .from(charts)
      .where(eq(charts.reportId, reportId))
      .orderBy(charts.id)

    const buildCharts = await Promise.all(
      savedCharts.map((chart) =>
        buildChartByType(
          chart.id,
          report.location ?? undefined,
          (report.filters ?? []) as Filter[],
          chart.config as ChartConfig
        )
      )
    )

    return { report, charts: buildCharts }
  } catch (error) {
    console.error('Failed to load report view:', error)
    throw new Response('Kunde inte ladda rapporten.', { status: 500 })
  }
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
