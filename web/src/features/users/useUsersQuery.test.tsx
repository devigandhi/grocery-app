import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createTestQueryClient } from "@/test/render";
import { useUserQuery, useUsersQuery, useUsersSearchQuery } from "./useUsersQuery";

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

describe("useUsersQuery", () => {
  it("fetches a paginated list of users", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: [], total: 0, page: 1, pageSize: 20 },
    });

    const { result } = renderHook(() => useUsersQuery({ page: 1 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith("/users", { params: { page: 1 } });
  });
});

describe("useUserQuery", () => {
  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useUserQuery(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("fetches the user by id when provided", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { id: "u1" } });

    const { result } = renderHook(() => useUserQuery("u1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith("/users/u1");
  });
});

describe("useUsersSearchQuery", () => {
  it("is disabled for an empty query string", () => {
    const { result } = renderHook(() => useUsersSearchQuery(""), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("searches users when a query string is provided", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useUsersSearchQuery("jane"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith("/users/search", {
      params: { q: "jane" },
    });
  });
});
