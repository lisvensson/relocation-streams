import { Outlet, useLocation } from 'react-router'
import type { Route } from './+types/shell'
import { requireUserMiddleware } from '~/middleware/requireUserMiddleware'
import { userSessionContext } from '~/context/userSessionContext'
import Navbar from '~/components/Navbar'
import { db } from '~/shared/database'
import { eq } from 'drizzle-orm'
import { user } from '~/shared/database/schema'

export const middleware: Route.MiddlewareFunction[] = [requireUserMiddleware]

export async function loader({ context }: Route.LoaderArgs) {
  const userSession = context.get(userSessionContext)

  if (!userSession?.user?.email) {
    return { isLoggedIn: false, user: null }
  }

  try {
    const [existingUser] = await db
      .select({
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.email, userSession.user.email))

    if (!existingUser) {
      return { isLoggedIn: false, user: null }
    }

    return {
      isLoggedIn: true,
      user: existingUser,
    }
  } catch (error) {
    console.error('Failed to load user in shell:', error)
    return { isLoggedIn: false, user: null }
  }
}

export default function Shell({ loaderData }: Route.ComponentProps) {
  const { isLoggedIn, user } = loaderData
  const location = useLocation()
  const hideNavbar =
    location.pathname.startsWith('/rapport/') ||
    location.pathname.startsWith('/skapa-rapport/') ||
    location.pathname.startsWith('/visa-rapport/')

  return (
    <div className="min-h-screen flex">
      {!hideNavbar && <Navbar isLoggedIn={isLoggedIn} user={user} />}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
