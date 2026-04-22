import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import type { Route } from './+types/root'
import './app.css'
import { Toaster } from './components/ui/sonner'
import { Button } from './components/ui/button'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Ett fel uppstod'
  let details = 'Något gick fel. Försök igen senare.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    const detailInfo = error.data?.toString().trim() || null
    message = `Fel ${error.status}`

    if (detailInfo) {
      details = detailInfo
    } else {
      switch (error.status) {
        case 404:
          details = 'Sidan kunde inte hittas.'
          break
        case 403:
          details = 'Åtkomst nekad.'
          break
        case 500:
          details = 'Ett serverfel uppstod.'
          break
        default:
          details = 'Något gick fel. Försök igen senare.'
      }
    }
  } else if (import.meta.env.DEV && error instanceof Error) {
    message = 'Oväntat fel'
    details = error.message
    stack = error.stack
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-3xl w-full space-y-6">
        <h1 className="text-4xl font-bold">{message}</h1>
        <p className="text-lg text-muted-foreground">{details}</p>

        <div className="pt-4">
          <Button asChild>
            <a href="/rapporter">Till rapporter</a>
          </Button>
        </div>

        {stack && (
          <pre className="mt-8 p-6 bg-muted rounded-md text-left overflow-auto text-sm max-h-[50vh]">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  )
}
