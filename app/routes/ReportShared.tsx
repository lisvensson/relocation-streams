import { db } from '~/shared/database'
import { eq } from 'drizzle-orm'
import { sharedReports } from '~/shared/database/schema'
import type { Route } from './+types/ReportShared'
import ChartRenderer from '~/components/charts/ChartRenderer'
import type { ChartModel } from '~/shared/database/models/chartModels'

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.sharedId
  if (!id) {
    throw new Response('Ogiltig delad rapport-länk', { status: 400 })
  }

  try {
    const [sharedReport] = await db
      .select()
      .from(sharedReports)
      .where(eq(sharedReports.id, id))

    if (!sharedReport) {
      throw new Response('Delad rapport hittades inte.', { status: 404 })
    }

    return {
      sharedReport: {
        ...sharedReport,
        charts: sharedReport.charts as ChartModel[],
      },
    }
  } catch (error) {
    console.error('Failed to load shared report:', error)
    throw new Response('Kunde inte ladda delad rapport.', { status: 500 })
  }
}

export default function ReportShared({ loaderData }: Route.ComponentProps) {
  const { sharedReport } = loaderData

  return (
    <div className="min-h-screen flex">
      <main className="flex-1 p-6">
        <div className="space-y-6">
          <div className="pb-4 border-b flex items-center justify-between">
            <h1 className="text-2xl font-bold">{sharedReport.title}</h1>
          </div>

          {sharedReport.description && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Beskrivning</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {sharedReport.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            {sharedReport.charts.map((chart) => (
              <ChartRenderer key={chart.id} {...chart} readOnly />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
