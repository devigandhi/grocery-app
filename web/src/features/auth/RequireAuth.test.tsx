import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RequireAuth } from "./RequireAuth";

vi.mock("./useAuth", () => ({ useAuth: vi.fn() }));

import { useAuth } from "./useAuth";

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/app/protected"]}>
      <Routes>
        <Route path="/" element={<div>Home page</div>} />
        <Route element={<RequireAuth />}>
          <Route path="/app/protected" element={<div>Protected content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  it("shows a loading state while the session is resolving", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      user: undefined,
    });

    renderProtected();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to / when not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      user: null,
    });

    renderProtected();
    expect(screen.getByText("Home page")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the protected route when authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      user: { id: "1", name: "Jane", phoneNumber: "+1", role: "USER" },
    });

    renderProtected();
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
