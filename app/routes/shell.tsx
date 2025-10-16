import { Outlet } from "react-router";
import type { Route } from "./+types/shell";
import { requireUserMiddleware } from "~/middleware/requireUserMiddleware";
import { userSessionContext } from "~/context/userSessionContext";
import Navbar from "~/components/Navbar";

export const middleware: Route.MiddlewareFunction[] = [requireUserMiddleware];

export async function loader({ context }: { context: any }) {
  const user = context.get(userSessionContext);

  return { isLoggedIn: Boolean(user?.user) }
}

export default function Shell({ loaderData }: { loaderData: { isLoggedIn: boolean } }) {
  return (
    <div>
      <Navbar isLoggedIn={loaderData.isLoggedIn} />
      <Outlet />
    </div>
  );
}