import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/useAuth";

export function HomePage() {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        Grocery lists, shared the easy way
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Build your shopping list from a shared catalog, then send it to
        friends and family over WhatsApp or Email.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        {!isLoading && isAuthenticated ? (
          <Button size="lg" render={<Link to={isAdmin ? "/admin/dashboard" : "/app/grocery"} />}>
            {isAdmin ? "Go to admin dashboard" : "Go to my list"}
          </Button>
        ) : (
          <>
            <Button size="lg" render={<Link to="/register" />}>
              Get started
            </Button>
            <Button size="lg" variant="outline" render={<Link to="/login" />}>
              Log in
            </Button>
          </>
        )}
      </div>

      <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Browse by category</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Find items fast from a catalog grouped by category.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Track quantity &amp; shop</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Add quantity, unit, and a preferred shop to every item.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Share instantly</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Send your list to anyone via WhatsApp or Email in one tap.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
