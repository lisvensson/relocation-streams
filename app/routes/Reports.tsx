import { desc, eq, and } from 'drizzle-orm'
import { db } from '~/shared/database'
import { charts, reports, sharedReports } from '~/shared/database/schema'
import type { Route } from './+types/Reports'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { ArrowUpRightIcon, MoreHorizontalIcon, Trash2Icon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu'
import { Form, Link, redirect } from 'react-router'
import { Button } from '~/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { CreateReport } from '~/components/reports/CreateReport'
import { userSessionContext } from '~/context/userSessionContext'
import { Badge } from '~/components/ui/badge'
import { buildSharedReportSnapshot } from '~/lib/buildSharedReportSnapshot'
import type { ChartConfig } from '~/shared/database/models/chartModels'

export async function loader({ context }: Route.LoaderArgs) {
  const userSession = context.get(userSessionContext)
  if (!userSession) throw redirect('/logga-in')

  try {
    const allReports = await db
      .select({
        id: reports.id,
        title: reports.title,
        createdAt: reports.createdAt,
        sharedId: sharedReports.id,
      })
      .from(reports)
      .leftJoin(sharedReports, eq(sharedReports.reportId, reports.id))
      .where(eq(reports.userId, userSession.user.id))
      .orderBy(desc(reports.createdAt))

    return { reports: allReports }
  } catch (error) {
    console.error('Failed to load reports:', error)
    throw new Response('Kunde inte ladda rapporter.', { status: 500 })
  }
}

export async function action({ context, request }: Route.ActionArgs) {
  const userSession = context.get(userSessionContext)
  if (!userSession) throw redirect('/logga-in')

  const formData = await request.formData()
  const reportId = formData.get('id') as string
  const intent = formData.get('intent')

  try {
    switch (intent) {
      case 'createReport': {
        const [report] = await db
          .insert(reports)
          .values({
            userId: userSession.user.id,
            title: '',
            description: '',
          })
          .returning({ id: reports.id })

        return redirect(`/rapport/${report.id}`)
      }

      case 'shareReport': {
        const [report] = await db
          .select()
          .from(reports)
          .where(eq(reports.id, reportId))

        if (!report) {
          throw new Response('Rapporten hittades inte.', { status: 404 })
        }

        const snapshot = await buildSharedReportSnapshot(reportId)

        const existing = await db
          .select()
          .from(sharedReports)
          .where(eq(sharedReports.reportId, reportId))

        if (existing.length > 0) {
          const [updated] = await db
            .update(sharedReports)
            .set({
              title: snapshot.report.title,
              description: snapshot.report.description,
              charts: snapshot.charts,
            })
            .where(eq(sharedReports.reportId, reportId))
            .returning()

          return { sharedReportId: updated.id }
        }

        const [shared] = await db
          .insert(sharedReports)
          .values({
            title: snapshot.report.title,
            description: snapshot.report.description,
            reportId,
            charts: snapshot.charts,
          })
          .returning()

        return { sharedReportId: shared.id }
      }

      case 'duplicateReport': {
        const [report] = await db
          .select()
          .from(reports)
          .where(
            and(
              eq(reports.id, reportId),
              eq(reports.userId, userSession.user.id)
            )
          )

        if (!report) {
          throw new Response('Rapporten hittades inte.', { status: 404 })
        }

        const [newReport] = await db
          .insert(reports)
          .values({
            userId: userSession.user.id,
            title: report.title ? `${report.title} (kopia)` : 'Kopia',
            description: report.description,
            location: report.location,
            filters: report.filters,
          })
          .returning({ id: reports.id })

        const chartsFromReport = await db
          .select()
          .from(charts)
          .where(eq(charts.reportId, reportId))
          .orderBy(charts.id)

        for (const chart of chartsFromReport) {
          await db.insert(charts).values({
            reportId: newReport.id,
            config: chart.config as ChartConfig,
          })
        }

        return null
      }

      case 'deleteReport': {
        const [report] = await db
          .select()
          .from(reports)
          .where(
            and(
              eq(reports.id, reportId),
              eq(reports.userId, userSession.user.id)
            )
          )

        if (!report) {
          throw new Response(
            'Du har inte behörighet att radera denna rapport.',
            {
              status: 403,
            }
          )
        }

        await db.delete(reports).where(eq(reports.id, reportId))
        return null
      }

      default:
        return null
    }
  } catch (error) {
    console.error('Action error:', error)
    throw new Response('Ett fel uppstod vid hantering av rapporten.', {
      status: 500,
    })
  }
}

export default function Reports({ loaderData }: Route.ComponentProps) {
  const { reports } = loaderData

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-bold">Rapporter</h1>
        <CreateReport />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titel</TableHead>
            <TableHead>Skapad</TableHead>
            <TableHead>Delningsstatus</TableHead>
            <TableHead className="text-right">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">
                <Link to={`/rapport/${r.id}`} className="hover:underline">
                  {r.title || 'Titel saknas'}
                </Link>
              </TableCell>

              <TableCell>
                {new Date(r.createdAt).toLocaleDateString('sv-SE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </TableCell>

              <TableCell>
                {r.sharedId ? (
                  <Badge asChild variant="secondary" className="cursor-pointer">
                    <a
                      href={`/delad-rapport/${r.sharedId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Delad länk <ArrowUpRightIcon className="size-3 ml-1" />
                    </a>
                  </Badge>
                ) : (
                  <Badge variant="outline">Ej delad</Badge>
                )}
              </TableCell>

              <TableCell className="text-right">
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontalIcon />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/rapport/${r.id}`}>Redigera</Link>
                      </DropdownMenuItem>
                      {r.sharedId ? (
                        <DropdownMenuItem
                          disabled
                          className="opacity-50 pointer-events-none"
                        >
                          Delad
                        </DropdownMenuItem>
                      ) : (
                        <Form method="post">
                          <input
                            type="hidden"
                            name="intent"
                            value="shareReport"
                          />
                          <input type="hidden" name="id" value={r.id} />
                          <DropdownMenuItem asChild>
                            <button type="submit" className="w-full text-left">
                              Dela
                            </button>
                          </DropdownMenuItem>
                        </Form>
                      )}

                      <Form method="post">
                        <input
                          type="hidden"
                          name="intent"
                          value="duplicateReport"
                        />
                        <input type="hidden" name="id" value={r.id} />
                        <DropdownMenuItem asChild>
                          <button type="submit" className="w-full text-left">
                            Duplicera
                          </button>
                        </DropdownMenuItem>
                      </Form>

                      <DropdownMenuSeparator />
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem variant="destructive">
                          Radera
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                      </AlertDialogMedia>
                      <AlertDialogTitle>Radera rapport?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Detta går inte att ångra. Hela rapporten och alla dess
                        diagram tas bort permanent.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">
                        Avbryt
                      </AlertDialogCancel>
                      <Form method="post">
                        <input
                          type="hidden"
                          name="intent"
                          value="deleteReport"
                        />
                        <input type="hidden" name="id" value={r.id} />
                        <AlertDialogAction variant="destructive" asChild>
                          <button type="submit" className="w-full">
                            Radera
                          </button>
                        </AlertDialogAction>
                      </Form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
