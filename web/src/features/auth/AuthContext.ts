import { createContext } from "react";
import type { CurrentUserPayload } from "@/lib/types";

export interface AuthContextValue {
  user: CurrentUserPayload | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
