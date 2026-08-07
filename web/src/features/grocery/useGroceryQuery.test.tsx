import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createTestQueryClient } from "@/test/render";
import { useGroceryCatalogQuery, useGroceryListQuery } from "./useGroceryQuery";

vi.mock("@/lib/api", () => ({
  apiClient: { get: vi.fn() },
}));

import { apiClient } from "@/lib/api";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useGroceryCatalogQuery", () => {
  it("fetches the catalog grouped by category", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [{ category: "Produce", items: [] }],
    });

    const { result } = renderHook(() => useGroceryCatalogQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith("/grocery", {
      params: { groupBy: "category" },
    });
    expect(result.current.data).toEqual([{ category: "Produce", items: [] }]);
  });
});

describe("useGroceryListQuery", () => {
  it("fetches a paginated list with the given params", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: [], total: 0, page: 1, pageSize: 20 },
    });

    const { result } = renderHook(
      () => useGroceryListQuery({ page: 1, category: "Produce" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith("/grocery", {
      params: { page: 1, category: "Produce" },
    });
  });
});
