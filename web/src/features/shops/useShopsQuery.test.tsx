import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createTestQueryClient } from "@/test/render";
import { useShopsQuery } from "./useShopsQuery";

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

describe("useShopsQuery", () => {
  it("fetches a paginated list of shops with the given params", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: [], total: 0, page: 1, pageSize: 20 },
    });

    const { result } = renderHook(() => useShopsQuery({ page: 2 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith("/shops", { params: { page: 2 } });
  });
});
