import { Form, redirect } from 'react-router'
import type { Route } from './+types/SignIn'
import { auth } from '~/shared/auth'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { db } from '~/shared/database'
import { user } from '~/shared/database/schema'
import { eq } from 'drizzle-orm'

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const email = formData.get('email') as string

  const existingUser = await db.select().from(user).where(eq(user.email, email))

  if (existingUser.length === 0) {
    return redirect(`/signin/otp?email=${email}`)
  }

  const response = await auth.api.sendVerificationOTP({
    body: { email, type: 'sign-in' },
    asResponse: true,
  })

  if (response.ok) {
    return redirect(`/signin/otp?email=${email}`, {
      headers: response.headers,
    })
  }
}

export default function SignIn() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Logga in</h1>
        <p className="text-gray-600 mb-6">Logga in för att se flyttströmmar</p>
        <div className="mt-4">
          <Form method="post" className="mb-4 space-y-4">
            <Input
              type="email"
              name="email"
              required
              placeholder="E-postadress"
              className="w-full px-3 py-2 border rounded-md"
            />
            <Button type="submit" className="w-full">
              Logga in
            </Button>
          </Form>
          {/* Inloggning med Microsoft */}
          {/* <Button
            type="button"
            onClick={() =>
              authClient.signIn.social({
                provider: 'microsoft',
                callbackURL: '/',
              })
            }
            className="w-full"
          >
            Logga in med Microsoft <i className="fa-brands fa-microsoft"></i>
          </Button> */}
        </div>
      </div>
    </div>
  )
}
