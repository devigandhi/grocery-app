import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  ShoppingListShareReceived,
  ShoppingListShareSent,
} from "@/lib/types";

export function useSharesReceivedQuery() {
  return useQuery({
    queryKey: ["shares", "received"],
    queryFn: async () => {
      const { data } = await apiClient.get<ShoppingListShareReceived[]>(
        "/shares/received",
      );
      return data;
    },
  });
}

export function useSharesSentQuery() {
  return useQuery({
    queryKey: ["shares", "sent"],
    queryFn: async () => {
      const { data } = await apiClient.get<ShoppingListShareSent[]>(
        "/shares/sent",
      );
      return data;
    },
  });
}
