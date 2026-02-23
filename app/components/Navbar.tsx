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
      <h2 className="text-xl font-semibold text-indigo-600 mb-6">
        Flyttströmmar
      </h2>

      <nav className="flex flex-col gap-3 flex-1">
        <Link to="/" className="text-gray-700 hover:text-indigo-600">
          Hem
        </Link>

        <Link to="/rapporter" className="text-gray-700 hover:text-indigo-600">
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
            className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
          >
            <LogOutIcon />
          </Button>
        </Form>
      )}
    </aside>
  )
}
