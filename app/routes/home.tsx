import { userSessionContext } from '~/context/userSessionContext'

export async function loader({ context }: { context: any }) {
  const user = context.get(userSessionContext)
  const userName = user.user.name
  return { userName }
}

export default function Home({ loaderData }: { loaderData: any }) {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Välkommen {loaderData.userName}!
        </h1>
      </div>
    </div>
  )
}
