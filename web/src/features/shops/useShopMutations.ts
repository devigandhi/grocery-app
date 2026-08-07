import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Shop } from "@/lib/types";

export interface CreateShopDto {
  name: string;
  location: string;
}

export interface UpdateShopDto {
  name?: string;
  location?: string;
}

export function useCreateShopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateShopDto) => {
      const { data } = await apiClient.post<Shop>("/shops", dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops", "list"] });
    },
  });
}

export function useUpdateShopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dto }: UpdateShopDto & { id: string }) => {
      const { data } = await apiClient.patch<Shop>(`/shops/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops", "list"] });
    },
  });
}

export function useDeleteShopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/shops/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops", "list"] });
    },
  });
}
