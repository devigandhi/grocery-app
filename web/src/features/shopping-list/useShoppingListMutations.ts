import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Unit } from "@/lib/enums";
import type { ShoppingListItem } from "@/lib/types";

export interface AddItemDto {
  groceryId: string;
  quantity: number;
  unit: Unit;
  shopId?: string;
}

export interface UpdateItemDto {
  quantity?: number;
  unit?: Unit;
  shopId?: string;
  isChecked?: boolean;
}

export function useAddShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: AddItemDto) => {
      const { data } = await apiClient.post<ShoppingListItem>(
        "/shopping-lists/items",
        item,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list", "me"] });
    },
  });
}

export function useUpdateShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dto }: UpdateItemDto & { id: string }) => {
      const { data } = await apiClient.patch<ShoppingListItem>(
        `/shopping-lists/items/${id}`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list", "me"] });
    },
  });
}

export function useDeleteShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/shopping-lists/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list", "me"] });
    },
  });
}
