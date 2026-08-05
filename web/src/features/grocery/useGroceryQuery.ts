import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Grocery, GroceryCategoryGroup, Paginated } from "@/lib/types";

export interface GroceryListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}

export function useGroceryCatalogQuery() {
  return useQuery({
    queryKey: ["grocery", "list", { groupBy: "category" }],
    queryFn: async () => {
      const { data } = await apiClient.get<GroceryCategoryGroup[]>(
        "/grocery",
        { params: { groupBy: "category" } },
      );
      return data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useGroceryListQuery(params: GroceryListParams = {}) {
  return useQuery({
    queryKey: ["grocery", "list", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Grocery>>("/grocery", {
        params,
      });
      return data;
    },
    staleTime: 5 * 60_000,
  });
}
