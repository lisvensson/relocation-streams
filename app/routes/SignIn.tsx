import { authClient } from '~/shared/auth/client'

export default function SignIn() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Logga in</h1>
        <p className="text-gray-600 mb-6">Logga in för att se flyttströmmar</p>
        <div className="mt-4">
          <button
            type="button"
            onClick={() =>
              authClient.signIn.social({
                provider: 'microsoft',
                callbackURL: '/',
              })
            }
            className="w-full bg-gray-100 text-gray-800 py-2 rounded-md border border-gray-300 hover:bg-gray-200"
          >
            Logga in med Microsoft <i className="fa-brands fa-microsoft"></i>
          </button>
        </div>
      </div>
    </div>
  )
}
