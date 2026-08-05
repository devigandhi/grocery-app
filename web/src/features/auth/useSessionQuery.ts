import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { CurrentUserPayload } from "@/lib/types";

export function useSessionQuery() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ user: CurrentUserPayload }>(
        "/auth/session",
      );
      return data.user;
    },
    retry: false,
    staleTime: 5 * 60_000,
  });
}
