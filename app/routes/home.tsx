import { redirect } from 'react-router'
import { Button } from '~/components/ui/button'
import { userSessionContext } from '~/context/userSessionContext'
import type { Route } from './+types/home'
import { db } from '~/shared/database'
import { charts, reports } from '~/shared/database/schema'
import { CreateReport } from '~/components/reports/CreateReport'

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get(userSessionContext)
  if (!user) throw new Error('Användare saknas')
  const userName = user.user.name
  return { userName }
}

export async function action({ context, request }: Route.ActionArgs) {
  const userSession = context.get(userSessionContext)
  if (!userSession) throw new Error('Användare saknas')

  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'createReport') {
    const [report] = await db
      .insert(reports)
      .values({
        userId: userSession.user.id,
        title: 'Ny rapport',
      })
      .returning({ id: reports.id })

    await db.insert(charts).values({
      reportId: report.id,
      config: {
        type: 'netflow',
        measure: '',
        category: '',
        chartType: '',
        uiSettings: {
          containerSize: 'medium',
          tablePlacement: 'hidden',
          legendPlacement: 'top',
        },
        measureCalculation: '',
        maxNumberOfCategories: 0,
        combineRemainingCategories: false,
      },
    })

    return redirect(`/rapport/${report.id}`)
  }

  return null
}

export default function Home({ loaderData }: { loaderData: any }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Välkommen {loaderData.userName}</h1>
      <p>Här kan du skapa och hantera dina rapporter.</p>
      <CreateReport />
    </div>
  )
}
