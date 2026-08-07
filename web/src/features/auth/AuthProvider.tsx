import type { ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import { useSessionQuery } from "./useSessionQuery";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useSessionQuery();

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !isLoading && !!user,
    isAdmin: !isLoading && user?.role === "ADMIN",
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
