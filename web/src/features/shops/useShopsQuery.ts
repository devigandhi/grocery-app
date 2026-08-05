import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Paginated, Shop } from "@/lib/types";

export interface ShopListParams {
  page?: number;
  pageSize?: number;
}

export function useShopsQuery(params: ShopListParams = {}) {
  return useQuery({
    queryKey: ["shops", "list", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Shop>>("/shops", {
        params,
      });
      return data;
    },
    staleTime: 5 * 60_000,
  });
}
