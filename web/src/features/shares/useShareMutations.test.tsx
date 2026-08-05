import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useCreateShareMutation } from "./useShareMutations";

vi.mock("@/lib/api", () => ({
  apiClient: { post: vi.fn() },
}));

import { apiClient } from "@/lib/api";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }
  return { wrapper, invalidateSpy };
}

describe("useCreateShareMutation", () => {
  it("posts the share and invalidates share history, returning the API's payload", async () => {
    const { wrapper, invalidateSpy } = makeWrapper();
    const apiResult = {
      share: { id: "share-1" },
      whatsappUrl: "https://wa.me/15551234567?text=hello",
      emailPayload: { subject: "s", body: "b" },
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: apiResult });

    const { result } = renderHook(() => useCreateShareMutation(), { wrapper });
    result.current.mutate({
      shoppingListId: "list-1",
      sharedWithUserId: "user-2",
      channel: "WHATSAPP",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith("/shares", {
      shoppingListId: "list-1",
      sharedWithUserId: "user-2",
      channel: "WHATSAPP",
    });
    expect(result.current.data).toEqual(apiResult);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["shares", "sent"] });
  });
});
