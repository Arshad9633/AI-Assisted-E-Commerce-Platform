import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import http from "../lib/http";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { ADMIN_BASE, USER_BASE } from "../config/routes";
import Navbar from "../components/Navbar";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

export default function SignIn() {
  const { isAuthenticated, login, roles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // If you're already signed in, don’t show SignIn; send to the right home.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (roles?.includes("ADMIN")) navigate(ADMIN_BASE, { replace: true });
    else navigate("/", { replace: true });
  }, [isAuthenticated, roles, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      // Expecting backend to return { token, email, roles } (any shape is fine; login() normalizes)
      const { data } = await http.post("/api/auth/signin", {
        email: values.email,
        password: values.password,
      });

      // Save to context (writes to localStorage and updates state)
      const session = login(data);

      // Optional: set axios default header for the current tab session
      if (session?.token) {
        http.defaults.headers.common.Authorization = `Bearer ${session.token}`;
      }

      toast.success("Signed in successfully!");

      // Respect "return to" if it exists and is safe for the user’s role
      const from = location.state?.from?.pathname;
      const isAdmin = session.roles?.includes("ADMIN");

      if (isAdmin) {
        navigate(ADMIN_BASE, { replace: true });
      } else {
        const fallback =
          from && !from.startsWith(ADMIN_BASE) ? from : "/";
        navigate(fallback, { replace: true });
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        (status === 401 ? "Invalid email or password" :
         status === 502 ? "Backend not reachable. Try again in a moment." :
         err.message || "Sign in failed");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <Navbar />
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="Email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="size-4 rounded border-gray-300"
              {...register("remember")}
            />
            Remember me
          </label>
          <Link to="#" className="text-sm text-gray-900 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          No account?{" "}
          <Link to="/signup" className="font-medium text-gray-900 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
