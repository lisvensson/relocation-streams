import { createContext } from "react-router";

export type UserSession = {
  session: { token: string; expiresAt: string }
  user: { id: string; email: string; name: string }
};

export const userSessionContext = createContext<UserSession | null>(null); 