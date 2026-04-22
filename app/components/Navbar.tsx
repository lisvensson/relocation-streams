import { Link, useNavigate, useLocation } from 'react-router'
import { authClient } from '~/shared/auth/client'
import { ClipboardClockIcon, HomeIcon, LogOutIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'

type Props = {
  isLoggedIn: boolean
  user: { name: string; email: string } | null
}

export default function Navbar({ isLoggedIn, user }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate('/logga-in'),
      },
    })
  }

  return (
    <aside className="w-64 h-screen border-r flex flex-col p-4 bg-background">
      <h2 className="text-lg font-semibold text-primary mb-6">Flyttströmmar</h2>
      <nav className="flex flex-col gap-2 flex-1 text-sm">
        <Link
          to="/"
          className={
            'flex items-center gap-2 px-2 py-1.5 rounded-md transition ' +
            (pathname === '/'
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground')
          }
        >
          <HomeIcon className="size-4" />
          Hem
        </Link>

        <Link
          to="/rapporter"
          className={
            'flex items-center gap-2 px-2 py-1.5 rounded-md transition ' +
            (pathname === '/rapporter'
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground')
          }
        >
          <ClipboardClockIcon className="size-4" />
          Rapporter
        </Link>
      </nav>

      {isLoggedIn && user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 p-2 h-auto justify-start"
            >
              <div className="size-9 rounded-full bg-muted flex items-center justify-center">
                <span className="font-medium">
                  {user.name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              </div>
              <div className="flex flex-col leading-tight text-left">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOutIcon className="size-4 mr-2" />
              Logga ut
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </aside>
  )
}
