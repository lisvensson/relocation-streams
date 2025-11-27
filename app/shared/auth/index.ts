import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '~/shared/database'
import { emailOTP } from 'better-auth/plugins'
import { Resend } from 'resend'
import 'dotenv/config'

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        let subject = ''
        let html = ''
        const loginUrl = `http://localhost:5173/signin/otp?email=${email}&otp=${otp}`

        if (type === 'sign-in') {
          subject = 'Din engångskod för inloggning'
          html = `
            <div>
              <p>Hej!</p>
              <p><strong>Din engångskod för inloggning är:</strong> ${otp}</p>
              <p><a href="${loginUrl}">Klicka här för att logga in direkt</a></p>
            </div>
          `
          console.log(`Engångskod för inloggning: ${otp} skickas till ${email}`)
        }
        const { data, error } = await resend.emails.send({
          from: 'app@booiq.com',
          to: email,
          subject,
          html,
        })

        if (error) {
          console.error('Misslyckades att skicka OTP via Resend:', error)
        } else {
          console.log('OTP skickat via Resend, id:', data?.id)
        }
      },
    }),
  ],
})
