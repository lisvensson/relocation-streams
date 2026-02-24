import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { userSessionContext } from '~/context/userSessionContext'

export async function loader({ context }: { context: any }) {
  const user = context.get(userSessionContext)
  const userName = user.user.name
  return { userName }
}

export default function Home({ loaderData }: { loaderData: any }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Välkommen {loaderData.userName}</h1>

      <p>Här kan du skapa och hantera dina rapporter.</p>

      <div>
        <Button asChild>
          <Link to="/skapa-rapport">Skapa rapport</Link>
        </Button>
      </div>
    </div>
  )
}
