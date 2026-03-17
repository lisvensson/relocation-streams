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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { toast } from 'sonner'

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
            report.location?.toLowerCase(),
            report.filters,
            config
          )
          return { id: chart.id, ...buildChart, config }
        }

        if (config.type === 'temporal') {
          const buildChart = await buildTemporalChart(
            report.location?.toLowerCase(),
            report.filters,
            config
          )
          return { id: chart.id, ...buildChart, config }
        }

        if (config.type === 'category') {
          const built = await buildCategoryChart(
            report.location?.toLowerCase(),
            report.filters,
            config
          )
          return { id: chart.id, ...built, config }
        }

        if (config.type === 'temporal+category') {
          const built = await buildTemporalCategoryChart(
            report.location?.toLowerCase(),
            report.filters,
            config
          )
          return { id: chart.id, ...built, config }
        }

        return null
      })
    )

    const existingSharedReport = await db
      .select()
      .from(sharedReports)
      .where(eq(sharedReports.reportId, report.id))

    if (existingSharedReport.length > 0) {
      const [updateSharedReport] = await db
        .update(sharedReports)
        .set({
          title: report.title,
          description: report.description,
          charts: buildCharts,
        })
        .where(eq(sharedReports.reportId, report.id))
        .returning()

      return { sharedReportId: updateSharedReport.id }
    }

    const [sharedReport] = await db
      .insert(sharedReports)
      .values({
        title: report.title,
        reportId: report.id,
        description: report.description,
        charts: buildCharts,
      })
      .returning()

    return { sharedReportId: sharedReport.id }
  }

  if (intent === 'deleteSharedReport') {
    const sharedReportId = formData.get('sharedReportId') as string

    if (!sharedReportId) {
      throw new Response('Ingen delning att ta bort', { status: 400 })
    }

    await db.delete(sharedReports).where(eq(sharedReports.id, sharedReportId))

    return { sharedReportDeleted: true }
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
                <Button variant="outline" className="transition">
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
                    variant="outline"
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
              <DialogFooter className="flex flex-col items-start gap-2 mt-4">
                <Form method="post" className="w-full">
                  <input type="hidden" name="intent" value="shareReport" />
                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      toast.success('Delning uppdaterad!', {
                        description: 'Delningen av rapporten har uppdaterats.',
                        position: 'top-right',
                      })
                    }}
                  >
                    <ShareIcon className="size-4 mr-2" />
                    Uppdatera delning
                  </Button>
                </Form>
                <Form method="post" className="w-full">
                  <input
                    type="hidden"
                    name="sharedReportId"
                    value={sharedReportId}
                  />
                  <DialogClose asChild>
                    <Button
                      type="submit"
                      name="intent"
                      value="deleteSharedReport"
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        toast.info('Delning borttagen', {
                          description: 'Delningen av rapporten har raderats.',
                          position: 'top-right',
                        })
                      }}
                    >
                      Ta bort delning
                    </Button>
                  </DialogClose>
                </Form>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button asChild variant="outline" className="transition">
            <Link to="/rapporter" className="flex items-center">
              <XIcon className="size-4 mr-2" />
              Stäng
            </Link>
          </Button>
        </div>
      </div>

      {report.description && (
        <p className="text-muted-foreground whitespace-pre-wrap">
          {report.description}
        </p>
      )}

      <div className="grid grid-cols-12 gap-6">
        {charts.map((chart) => (
          <ChartRenderer key={chart.id} {...chart} readOnly={true} />
        ))}
      </div>
    </div>
  )
}
