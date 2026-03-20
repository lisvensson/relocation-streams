import { eq } from 'drizzle-orm'
import { db } from '~/shared/database'
import type { Route } from './+types/ReportView'
import { charts, reports, sharedReports } from '~/shared/database/schema'
import { buildNetFlowCategoryChart } from '~/shared/database/buildCharts/buildNetFlowCategoryChart'
import { buildTemporalChart } from '~/shared/database/buildCharts/buildTemporalChart'
import { buildCategoryChart } from '~/shared/database/buildCharts/buildCategoryChart'
import { buildTemporalCategoryChart } from '~/shared/database/buildCharts/buildTemporalCategoryChart'
import ChartRenderer from '~/components/charts/ChartRenderer'
import { Copy, LinkIcon, ShareIcon, XIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Form, Link } from 'react-router'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { toast } from 'sonner'
import { buildSharedReportSnapshot } from '~/lib/buildSharedReportSnapshot'

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

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'shareReport') {
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, params.reportId))

    if (!report) {
      throw new Response('Rapporten hittades inte', { status: 404 })
    }

    const snapshot = await buildSharedReportSnapshot(params.reportId)

    const existing = await db
      .select()
      .from(sharedReports)
      .where(eq(sharedReports.reportId, report.id))

    if (existing.length > 0) {
      const [updated] = await db
        .update(sharedReports)
        .set({
          title: snapshot.report.title,
          description: snapshot.report.description,
          charts: snapshot.charts,
        })
        .where(eq(sharedReports.reportId, params.reportId))
        .returning()

      return { sharedReportId: updated.id }
    }

    const [sharedReport] = await db
      .insert(sharedReports)
      .values({
        title: snapshot.report.title,
        description: snapshot.report.description,
        reportId: params.reportId,
        charts: snapshot.charts,
      })
      .returning()

    return { sharedReportId: sharedReport.id }
  }

  return null
}

export default function ReportView({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { report, charts } = loaderData
  const sharedReportId =
    actionData?.sharedReportId ?? loaderData.report.sharedId ?? ''
  const [open, setOpen] = useState(false)

  const sharedReportUrl =
    typeof window !== 'undefined' && sharedReportId
      ? `${window.location.origin}/delad-rapport/${sharedReportId}`
      : ''

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold">{report.title}</h1>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            {sharedReportId ? (
              <DialogTrigger asChild>
                <Button className="transition">
                  <LinkIcon className="size-4 mr-2" />
                  Visa delad länk
                </Button>
              </DialogTrigger>
            ) : (
              <DialogTrigger asChild>
                <Form method="post">
                  <Button
                    type="submit"
                    name="intent"
                    value="shareReport"
                    className="transition"
                  >
                    <ShareIcon className="size-4 mr-2" />
                    Dela rapport
                  </Button>
                </Form>
              </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delad länk</DialogTitle>
                <DialogDescription>
                  Alla med denna länk kan se rapporten.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <Input readOnly value={sharedReportUrl} className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(sharedReportUrl)
                    toast.success('Länk kopierad!', {
                      description: 'Länken har kopierats till urklipp.',
                      position: 'top-right',
                    })
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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
