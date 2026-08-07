import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { ShoppingList } from "@/lib/types";

export function useShoppingListQuery() {
  return useQuery({
    queryKey: ["shopping-list", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<ShoppingList[]>(
        "/shopping-lists/me",
      );
      return data;
    },
  });
}
