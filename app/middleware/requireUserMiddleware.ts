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
  try {
    const userSession = await auth.api.getSession(request)

    if (!userSession?.user) {
      throw redirect('/logga-in')
    }

    context.set(userSessionContext, userSession)
  } catch (error) {
    if (error instanceof Response) throw error
    throw redirect('/logga-in')
  }
}
