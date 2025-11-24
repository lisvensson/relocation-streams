import { Form, redirect, useSearchParams, useSubmit } from 'react-router'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { auth } from '~/shared/auth'
import type { Route } from './+types/SignInOtp'

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const otp = formData.get('otp') as string

  const response = await auth.api.signInEmailOTP({
    body: { email, otp },
    asResponse: true,
  })

  if (response.ok) {
    return redirect('/', {
      headers: response.headers,
    })
  }
  return response
}

export default function SignInOTP() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const otp = searchParams.get('otp') ?? ''

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Verifiera engångskod för att logga in
        </h1>
        <p className="text-gray-600 mb-6">
          Ange koden du fått skickad till din e-postadress.
        </p>

        <Form method="post" className="mt-4">
          <Input type="hidden" name="email" value={email} />
          <Input
            type="text"
            name="otp"
            defaultValue={otp}
            required
            placeholder="OTP-kod"
            className="mt-4 w-full"
          />
          <Button type="submit" className="mt-4 w-full">
            Verifiera
          </Button>
        </Form>
      </div>
    </div>
  )
}
