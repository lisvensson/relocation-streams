import { Link } from 'react-router'
import { userSessionContext } from '~/context/userSessionContext'

export async function loader({ context }: { context: any }) {
  const user = context.get(userSessionContext)
  const userName = user.user.name
  return { userName }
}

export default function Home({ loaderData }: { loaderData: any }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Välkommen {loaderData.userName}
      </h1>

      <p className="text-gray-600">
        Här kan du skapa och hantera dina rapporter.
      </p>

      <div>
        <Link
          to="/skapa-rapport"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Skapa rapport
        </Link>
      </div>
    </div>
  )
}
