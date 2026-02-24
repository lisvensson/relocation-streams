import { desc, eq } from 'drizzle-orm'
import { db } from '~/shared/database'
import { reports } from '~/shared/database/schema'
import type { Route } from './+types/Reports'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { MoreHorizontalIcon, Trash2Icon } from 'lucide-react'
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

export async function loader({}: Route.LoaderArgs) {
  const report = await db
    .select({
      id: reports.id,
      title: reports.title,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .orderBy(desc(reports.createdAt))

  return { report }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'deleteReport') {
    const reportId = formData.get('id') as string
    await db.delete(reports).where(eq(reports.id, reportId))
    return redirect(`/rapporter`)
  }

  return null
}

export default function Reports({ loaderData }: Route.ComponentProps) {
  const { report } = loaderData

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-bold">Rapporter</h1>

        <Button asChild>
          <Link to="/skapa-rapport">Skapa rapport</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titel</TableHead>
            <TableHead>Skapad</TableHead>
            <TableHead className="text-right">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">
                <Link to={`#`} className="hover:underline">
                  {r.title}
                </Link>
              </TableCell>

              <TableCell>
                {new Date(r.createdAt).toLocaleDateString('sv-SE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
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
                      <DropdownMenuItem>Dela</DropdownMenuItem>
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

                      <AlertDialogAction variant="destructive" asChild>
                        <Form method="post">
                          <input
                            type="hidden"
                            name="intent"
                            value="deleteReport"
                          />
                          <input type="hidden" name="id" value={r.id} />
                          <button type="submit">Radera</button>
                        </Form>
                      </AlertDialogAction>
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
