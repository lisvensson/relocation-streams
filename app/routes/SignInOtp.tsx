import { Form, redirect, useSearchParams } from 'react-router'
import { Button } from '~/components/ui/button'
import { auth } from '~/shared/auth'
import type { Route } from './+types/SignInOtp'
import { useState } from 'react'
import { FieldDescription, FieldGroup } from '~/components/ui/field'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '~/components/ui/input-otp'

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')
  const otp = formData.get('otp')

  if (typeof email !== 'string' || typeof otp !== 'string') {
    return { error: 'Ogiltiga indata' }
  }

  try {
    const response = await auth.api.signInEmailOTP({
      body: { email, otp },
      asResponse: true,
    })

    if (response.ok) {
      return redirect('/', {
        headers: response.headers,
      })
    }

    if (response.status === 400) {
      return { error: 'Fel kod. Försök igen.' }
    }

    return { error: 'Kunde inte verifiera koden. Försök igen senare.' }
  } catch (error) {
    console.error('OTP sign-in error:', error)
    return { error: 'Ett oväntat fel uppstod. Försök igen.' }
  }
}

export default function SignInOTP({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [value, setValue] = useState('')

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full">
        <FieldGroup className="flex flex-col gap-6 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">
              Verifiera engångskod för att logga in
            </h1>
            <FieldDescription>
              Ange koden du fått skickad till din e-postadress.
            </FieldDescription>
          </div>
          {actionData?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {actionData.error}
            </p>
          )}
          <Form method="post" className="flex flex-col gap-4 items-center">
            <input type="hidden" name="email" value={email} />

            <InputOTP maxLength={6} value={value} onChange={setValue}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <input type="hidden" name="otp" value={value} />
            <Button type="submit" className="w-full">
              Verifiera
            </Button>
          </Form>
        </FieldGroup>
      </div>
    </div>
  )
}
