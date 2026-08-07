import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Grocery } from "@/lib/types";

export interface CreateGroceryDto {
  item: string;
  category: string;
}

export interface UpdateGroceryDto {
  item?: string;
  category?: string;
}

export function useCreateGroceryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateGroceryDto) => {
      const { data } = await apiClient.post<Grocery>("/grocery", dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery", "list"] });
    },
  });
}

export function useUpdateGroceryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...dto
    }: UpdateGroceryDto & { id: string }) => {
      const { data } = await apiClient.patch<Grocery>(`/grocery/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery", "list"] });
    },
  });
}

export function useDeleteGroceryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/grocery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery", "list"] });
    },
  });
}
