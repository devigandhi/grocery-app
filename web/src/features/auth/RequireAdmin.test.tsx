import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RequireAdmin } from "./RequireAdmin";

vi.mock("./useAuth", () => ({ useAuth: vi.fn() }));

import { useAuth } from "./useAuth";

function renderAdminProtected() {
  return render(
    <MemoryRouter initialEntries={["/admin/dashboard"]}>
      <Routes>
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/app/grocery" element={<div>Grocery catalog</div>} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin/dashboard" element={<div>Admin dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAdmin", () => {
  it("shows a loading state while the session is resolving", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      user: undefined,
    });

    renderAdminProtected();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to / when not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      user: null,
    });

    renderAdminProtected();
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("redirects to /app/grocery when authenticated but not an admin", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      user: { id: "1", name: "Jane", phoneNumber: "+1", role: "USER" },
    });

    renderAdminProtected();
    expect(screen.getByText("Grocery catalog")).toBeInTheDocument();
  });

  it("renders the admin route for an admin session", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      user: { id: "1", name: "Jane", phoneNumber: "+1", role: "ADMIN" },
    });

    renderAdminProtected();
    expect(screen.getByText("Admin dashboard")).toBeInTheDocument();
  });
});
