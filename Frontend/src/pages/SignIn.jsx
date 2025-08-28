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
import { Link, useNavigate } from "react-router-dom";

// ✅ Validation schema
const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

export default function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  // ✅ Handle Sign In
  const onSubmit = async (values) => {
    try {
      setLoading(true);

      // Call backend API
      const res = await http.post("/api/auth/signin", {
        email: values.email,
        password: values.password,
      });

      // ✅ Extract returned data
      const token = res.data?.token;
      const roles = res.data?.roles || [];
      const email = res.data?.email;

      if (!token) throw new Error("No token found in response");

      // ✅ Save user data to localStorage
      setUser({
        token,
        email,
        roles, // <-- store roles here
      });

      toast.success("Signed in successfully!");

      // ✅ Redirect based on role
      if (roles.includes("ADMIN")) {
        navigate("/home/admin"); // Admin panel
      } else {
        navigate("/dashboard"); // Normal user dashboard
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Sign in failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="Email"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password */}
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        {/* Remember Me + Forgot Password */}
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

        {/* Submit Button */}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600">
          No account?{" "}
          <Link
            to="/signup"
            className="font-medium text-gray-900 hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
