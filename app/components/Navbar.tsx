import { Form, Link, useNavigate } from 'react-router'
import { authClient } from '~/shared/auth/client'
import { Button } from './ui/button'
import { LogOutIcon } from 'lucide-react'

type Props = {
  isLoggedIn: boolean
}

export default function Navbar({ isLoggedIn }: Props) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate('/')
        },
      },
    })
  }

  return (
    <aside className="w-64 h-screen border-r flex flex-col p-4">
      <h2 className="text-xl font-semibold text-primary mb-6">Flyttströmmar</h2>

      <nav className="flex flex-col gap-3 flex-1">
        <Link to="/" className="hover:text-primary">
          Hem
        </Link>

        <Link to="/rapporter" className="hover:text-primary">
          Rapporter
        </Link>
      </nav>

      {isLoggedIn && (
        <Form
          method="post"
          onSubmit={(e) => {
            e.preventDefault()
            handleSignOut()
          }}
        >
          <Button
            type="submit"
            variant="ghost"
            className="hover:text-destructive cursor-pointer"
          >
            <LogOutIcon className="size-5" />
          </Button>
        </Form>
      )}
    </aside>
  )
}
