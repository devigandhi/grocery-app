import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  useCreateShopMutation,
  useDeleteShopMutation,
  useUpdateShopMutation,
} from "./useShopMutations";

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

describe("useCreateShopMutation", () => {
  it("creates a shop and invalidates the shop list", async () => {
    const { wrapper, invalidateSpy } = makeWrapper();
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { id: "shop-1" } });

    const { result } = renderHook(() => useCreateShopMutation(), { wrapper });
    result.current.mutate({ name: "Whole Foods", location: "Main St" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith("/shops", {
      name: "Whole Foods",
      location: "Main St",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["shops", "list"] });
  });
});

describe("useUpdateShopMutation", () => {
  it("patches the shop by id and invalidates the shop list", async () => {
    const { wrapper, invalidateSpy } = makeWrapper();
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: { id: "shop-1" } });

    const { result } = renderHook(() => useUpdateShopMutation(), { wrapper });
    result.current.mutate({ id: "shop-1", name: "New Name" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.patch).toHaveBeenCalledWith("/shops/shop-1", {
      name: "New Name",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["shops", "list"] });
  });
});

describe("useDeleteShopMutation", () => {
  it("deletes the shop by id and invalidates the shop list", async () => {
    const { wrapper, invalidateSpy } = makeWrapper();
    vi.mocked(apiClient.delete).mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteShopMutation(), { wrapper });
    result.current.mutate("shop-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.delete).toHaveBeenCalledWith("/shops/shop-1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["shops", "list"] });
  });
});
