import { redirect } from 'react-router'
import { userSessionContext } from '~/context/userSessionContext'
import { auth } from '~/shared/auth'

export async function requireUserMiddleware({
  request,
  context,
}: {
  request: any
  context: any
}) {
  const userSession = await auth.api.getSession(request)

  if (!userSession?.user) {
    throw redirect('/signin')
  }

  context.set(userSessionContext, userSession)
}
