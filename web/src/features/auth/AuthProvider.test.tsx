import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./useAuth";

vi.mock("./useSessionQuery", () => ({
  useSessionQuery: vi.fn(),
}));

import { useSessionQuery } from "./useSessionQuery";

function mockSession(data: unknown, isLoading: boolean) {
  vi.mocked(useSessionQuery).mockReturnValue({
    data,
    isLoading,
  } as ReturnType<typeof useSessionQuery>);
}

describe("AuthProvider / useAuth", () => {
  it("reports loading while the session query is in flight", () => {
    mockSession(undefined, true);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it("reports unauthenticated when there is no user", () => {
    mockSession(null, false);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it("reports authenticated, non-admin for a USER session", () => {
    mockSession({ id: "1", role: "USER" }, false);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it("reports authenticated and admin for an ADMIN session", () => {
    mockSession({ id: "1", role: "ADMIN" }, false);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });
});
