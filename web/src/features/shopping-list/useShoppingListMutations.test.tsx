import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  useAddShoppingListItem,
  useDeleteShoppingListItem,
  useUpdateShoppingListItem,
} from "./useShoppingListMutations";

vi.mock("@/lib/api", () => ({
  apiClient: { post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
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

describe("useAddShoppingListItem", () => {
  it("posts the item and invalidates the shopping list on success", async () => {
    const { wrapper, invalidateSpy } = makeWrapper();
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { id: "item-1" } });

    const { result } = renderHook(() => useAddShoppingListItem(), { wrapper });
    result.current.mutate({ groceryId: "g1", quantity: 2, unit: "PCS" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith("/shopping-lists/items", {
      groceryId: "g1",
      quantity: 2,
      unit: "PCS",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["shopping-list", "me"],
    });
  });
});

describe("useUpdateShoppingListItem", () => {
  it("patches the item by id and invalidates the shopping list", async () => {
    const { wrapper, invalidateSpy } = makeWrapper();
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: { id: "item-1" } });

    const { result } = renderHook(() => useUpdateShoppingListItem(), {
      wrapper,
    });
    result.current.mutate({ id: "item-1", quantity: 3 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.patch).toHaveBeenCalledWith("/shopping-lists/items/item-1", {
      quantity: 3,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["shopping-list", "me"],
    });
  });
});

describe("useDeleteShoppingListItem", () => {
  it("deletes the item by id and invalidates the shopping list", async () => {
    const { wrapper, invalidateSpy } = makeWrapper();
    vi.mocked(apiClient.delete).mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteShoppingListItem(), {
      wrapper,
    });
    result.current.mutate("item-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.delete).toHaveBeenCalledWith("/shopping-lists/items/item-1");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["shopping-list", "me"],
    });
  });
});
