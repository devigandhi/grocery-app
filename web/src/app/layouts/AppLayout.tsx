import { Link, NavLink, Outlet } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/useAuth";
import { useLogoutMutation } from "@/features/auth/useAuthMutations";

const NAV_LINKS = [
  { to: "/app/grocery", label: "Grocery" },
  { to: "/app/shopping-list", label: "My List" },
  { to: "/app/shared-with-me", label: "Shared With Me" },
  { to: "/app/share-history", label: "Share History" },
];

export function AppLayout() {
  const { user } = useAuth();
  const logout = useLogoutMutation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/app/grocery" className="text-lg font-semibold">
            Grocery Sharing
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive
                    ? "font-medium text-neutral-900"
                    : "text-neutral-600 hover:text-neutral-900"
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
              {user?.name}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{user?.phoneNumber}</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {user?.role === "ADMIN" && (
                <DropdownMenuItem render={<Link to="/admin" />}>
                  Admin dashboard
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => logout.mutate()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
