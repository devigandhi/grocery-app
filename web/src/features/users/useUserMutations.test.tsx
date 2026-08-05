import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "./useUserMutations";

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

describe("useCreateUserMutation", () => {
  it("creates a user and invalidates the users list and search caches", async () => {
    const { wrapper, invalidateSpy } = makeWrapper();
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { id: "user-1" } });

    const { result } = renderHook(() => useCreateUserMutation(), { wrapper });
    result.current.mutate({
      name: "Jane",
      phoneNumber: "+15551234567",
      password: "password123",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith("/users", {
      name: "Jane",
      phoneNumber: "+15551234567",
      password: "password123",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users", "list"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users", "search"] });
  });
});

describe("useUpdateUserMutation", () => {
  it("patches the user by id and invalidates list, detail, and search caches", async () => {
    const { wrapper, invalidateSpy } = makeWrapper();
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: { id: "user-1" } });

    const { result } = renderHook(() => useUpdateUserMutation(), { wrapper });
    result.current.mutate({ id: "user-1", name: "New Name" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.patch).toHaveBeenCalledWith("/users/user-1", {
      name: "New Name",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users", "list"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users", "user-1"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users", "search"] });
  });
});

describe("useDeleteUserMutation", () => {
  it("deletes the user by id and invalidates list and search caches", async () => {
    const { wrapper, invalidateSpy } = makeWrapper();
    vi.mocked(apiClient.delete).mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteUserMutation(), { wrapper });
    result.current.mutate("user-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.delete).toHaveBeenCalledWith("/users/user-1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users", "list"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users", "search"] });
  });
});
