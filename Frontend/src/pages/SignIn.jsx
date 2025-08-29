import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import http from "../lib/http";
import { setUser } from "../lib/auth";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useLocation, useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

function normalizeRoles(raw) {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(",");
  return list.map(r => String(r).trim().toUpperCase()).filter(Boolean);
}

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      const res = await http.post("/api/auth/signin", {
        email: values.email,
        password: values.password,
      });

      const token = res.data?.token;
      const email = res.data?.email ?? values.email;
      const roles = normalizeRoles(res.data?.roles);

      if (!token) throw new Error("No token found in response");

      // Persist user
      setUser({ token, email, roles });

      // Immediately set default auth header for future requests this session
      http.defaults.headers.common.Authorization = `Bearer ${token}`;

      toast.success("Signed in successfully!");

      // If we were redirected here from a protected route, go back there
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Otherwise route by role
      if (roles.includes("ADMIN")) {
        navigate("/home/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
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
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
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
