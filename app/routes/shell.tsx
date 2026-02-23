import { Outlet, useLocation } from 'react-router'
import type { Route } from './+types/shell'
import { requireUserMiddleware } from '~/middleware/requireUserMiddleware'
import { userSessionContext } from '~/context/userSessionContext'
import Navbar from '~/components/Navbar'
import { db } from '~/shared/database'
import { eq } from 'drizzle-orm'
import { user } from '~/shared/database/schema'

export const middleware: Route.MiddlewareFunction[] = [requireUserMiddleware]

export async function loader({ context }: { context: any }) {
  const userSession = context.get(userSessionContext)

  let isLoggedIn = false

  if (userSession.user?.email) {
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, userSession.user.email))
    isLoggedIn = existingUser.length > 0
  }

  return { isLoggedIn }
}

export default function Shell({
  loaderData,
}: {
  loaderData: { isLoggedIn: boolean }
}) {
  const location = useLocation()

  const hideNavbar =
    location.pathname.startsWith('/rapport/') ||
    location.pathname.startsWith('/skapa-rapport')

  return (
    <div className="min-h-screen flex">
      {!hideNavbar && <Navbar isLoggedIn={loaderData.isLoggedIn} />}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
