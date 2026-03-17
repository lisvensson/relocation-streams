import { db } from '~/shared/database'
import { eq } from 'drizzle-orm'
import { sharedReports } from '~/shared/database/schema'
import type { Route } from './+types/ReportShared'
import ChartRenderer from '~/components/charts/ChartRenderer'

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.sharedId

  const [sharedReport] = await db
    .select()
    .from(sharedReports)
    .where(eq(sharedReports.id, id))

  if (!sharedReport) {
    throw new Response('Delad rapport hittades inte', { status: 404 })
  }

  return { sharedReport }
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
            <p className="text-muted-foreground">{sharedReport.description}</p>
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
