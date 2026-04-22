import { redirect } from 'react-router'
import { userSessionContext } from '~/context/userSessionContext'
import type { Route } from './+types/home'
import { db } from '~/shared/database'
import { reports } from '~/shared/database/schema'
import { CreateReport } from '~/components/reports/CreateReport'

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get(userSessionContext)
  if (!user) {
    throw redirect('/logga-in')
  }

  return {
    userName: user.user.name,
  }
}

export async function action({ context, request }: Route.ActionArgs) {
  const userSession = context.get(userSessionContext)
  if (!userSession) {
    throw redirect('/logga-in')
  }

  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'createReport') {
    try {
      const [report] = await db
        .insert(reports)
        .values({
          userId: userSession.user.id,
          title: '',
          description: '',
        })
        .returning({ id: reports.id })

      return redirect(`/rapport/${report.id}`)
    } catch (error) {
      console.error('Failed to create report:', error)
      return { error: 'Kunde inte skapa rapport' }
    }
  }

  return { error: 'Okänt intent' }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Välkommen {loaderData.userName}</h1>
      <p>Här kan du skapa och hantera rapporter</p>
      <CreateReport />
    </div>
  )
}
