import { userSessionContext } from '~/context/userSessionContext'
import type { Route } from './+types/CreateReport'
import { db } from '~/shared/database'
import { charts, reports } from '~/shared/database/schema'
import { redirect } from 'react-router'

export async function loader({ context }: Route.LoaderArgs) {
  const userSession = context.get(userSessionContext)

  if (!userSession) {
    throw new Error('User session missing')
  }

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
