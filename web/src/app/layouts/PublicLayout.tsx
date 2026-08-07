import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/useAuth";

export function PublicLayout() {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold">
            Grocery Sharing
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/about" className="text-neutral-600 hover:text-neutral-900">
              About
            </Link>
            {!isLoading && isAuthenticated ? (
              <Button size="sm" render={<Link to={isAdmin ? "/admin" : "/app/grocery"} />}>
                {isAdmin ? "Admin dashboard" : "My list"}
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-neutral-600 hover:text-neutral-900">
                  Login
                </Link>
                <Button size="sm" render={<Link to="/register" />}>
                  Register
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-4 text-center text-xs text-neutral-500">
        Grocery List Sharing App
      </footer>
    </div>
  );
}
