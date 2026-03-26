import { Form, redirect } from 'react-router'
import type { Route } from './+types/SignIn'
import { auth } from '~/shared/auth'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { db } from '~/shared/database'
import { user } from '~/shared/database/schema'
import { eq } from 'drizzle-orm'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field'

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
      <div className="max-w-md w-full">
        <FieldGroup className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Logga in</h1>
            <FieldDescription>
              Logga in för att se flyttströmmar
            </FieldDescription>
          </div>
          <Form method="post" className="space-y-4">
            <Field>
              <FieldLabel htmlFor="email">E‑postadress</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="namn@exempel.se"
                required
              />
            </Field>
            <Field>
              <Button type="submit" className="w-full">
                Logga in
              </Button>
            </Field>
          </Form>
        </FieldGroup>

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
  )
}
