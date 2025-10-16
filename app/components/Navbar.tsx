import { Form, Link, useNavigate } from "react-router";
import { authClient } from "~/shared/auth/client";

type Props = {
  isLoggedIn: boolean;
};

export default function Navbar({ isLoggedIn }: Props) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/");
        },
      },
    })
  }
  
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          <Link to="/" className="text-lg font-semibold text-indigo-600 hover:text-indigo-800">
            Hem
          </Link>
        </div>
        <div className="flex-1 text-right">
          {isLoggedIn ? (
            <Form
              method="post"
              onSubmit={(event) => {
                event.preventDefault(); 
                handleSignOut();
              }}
            >
              <button
                type="submit"
                className="text-sm font-medium text-red-600 hover:text-red-800 cursor-pointer"
              >
                Logga ut
              </button>
            </Form>
          ) : (
            <Link to="/signin" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
              Logga in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}