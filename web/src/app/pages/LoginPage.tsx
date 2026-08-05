import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/features/auth/useAuthMutations";
import { loginSchema, type LoginForm } from "@/features/auth/schemas";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginForm) => {
    login.mutate(values, {
      onSuccess: (user) => {
        // Decide off the just-fetched user, not useAuth()'s isAdmin — that
        // value is still computed from the pre-login session and hasn't
        // re-rendered yet, so it would send admins to /app/grocery.
        const from = (location.state as { from?: Location })?.from;
        navigate(
          from?.pathname ?? (user.role === "ADMIN" ? "/admin/dashboard" : "/app/grocery"),
          { replace: true },
        );
      },
    });
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>
            Welcome back — enter your phone number and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input
                id="phoneNumber"
                placeholder="+15551234567"
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-destructive">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            {login.error && (
              <p className="text-sm text-destructive">
                {login.error.message}
              </p>
            )}
            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/register" className="text-foreground underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
