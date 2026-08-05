import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import type { CurrentUserPayload } from "@/lib/types";
import type { LoginInput, RegisterInput } from "./types";

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      await apiClient.post("/auth/register", input);
      const { data } = await apiClient.get<{ user: CurrentUserPayload }>(
        "/auth/session",
      );
      return data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "session"], user);
    },
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    // Better Auth's /auth/login response doesn't carry our app's user shape
    // (id/name/role), so fetch the session right after login and hand the
    // real user back to the caller instead of making them read stale state.
    mutationFn: async (input: LoginInput) => {
      await apiClient.post("/auth/login", input);
      const { data } = await apiClient.get<{ user: CurrentUserPayload }>(
        "/auth/session",
      );
      return data.user;
    },
    onSuccess: (user) => {
      // setQueryData (not just invalidate) so isAuthenticated/isAdmin are
      // correct synchronously on the next render, before any navigation.
      queryClient.setQueryData(["auth", "session"], user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSuccess: () => {
      // Clear synchronously so isAuthenticated flips before the guard on
      // /login (if any) evaluates, then invalidate to drop any in-flight
      // refetch of the now-dead session.
      queryClient.setQueryData(["auth", "session"], null);
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      navigate("/login", { replace: true });
    },
  });
}
