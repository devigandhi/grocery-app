import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { ShareChannel } from "@/lib/enums";
import type { CreateShareResult } from "@/lib/types";

export interface CreateShareDto {
  shoppingListId: string;
  sharedWithUserId: string;
  channel: ShareChannel;
}

export function useCreateShareMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateShareDto) => {
      const { data } = await apiClient.post<CreateShareResult>(
        "/shares",
        dto,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shares", "sent"] });
    },
  });
}
