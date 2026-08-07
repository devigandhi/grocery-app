import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Paginated, UserSummary } from "@/lib/types";

export interface UserListParams {
  page?: number;
  pageSize?: number;
}

export function useUsersQuery(params: UserListParams = {}) {
  return useQuery({
    queryKey: ["users", "list", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<UserSummary>>("/users", {
        params,
      });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useUserQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data } = await apiClient.get<UserSummary>(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUsersSearchQuery(q: string) {
  return useQuery({
    queryKey: ["users", "search", q],
    queryFn: async () => {
      const { data } = await apiClient.get<UserSummary[]>("/users/search", {
        params: { q },
      });
      return data;
    },
    enabled: q.length > 0,
  });
}
