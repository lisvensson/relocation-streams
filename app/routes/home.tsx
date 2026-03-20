import { redirect } from 'react-router'
import { userSessionContext } from '~/context/userSessionContext'
import type { Route } from './+types/home'
import { db } from '~/shared/database'
import { reports } from '~/shared/database/schema'
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
        title: '',
        description: '',
      })
      .returning({ id: reports.id })

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
