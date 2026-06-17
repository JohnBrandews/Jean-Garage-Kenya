"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <AuthPageShell
      title="Sign in to your account"
      subtitle="Welcome back. Use your email and password to access your orders, dashboard, and cart."
      footerText="Need an account?"
      footerHref="/register"
      footerLinkLabel="Create one"
    >
      <div>
        <div className="mb-8 flex items-center gap-3 rounded-[1.35rem] border border-[#e1d5c1] bg-[#f6f1e6] px-4 py-4">
          <div className="h-2.5 w-2.5 rounded-full bg-[#c8a243]" />
          <p className="text-sm leading-6 text-[#5f5865]">
            Secure sign in for shoppers and admin accounts. Admin users can open the dashboard immediately after
            authentication.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input label="Email" type="email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
          <Input label="Password" type="password" placeholder="Enter your password" {...register("password")} error={errors.password?.message} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="primary" className="w-full rounded-none bg-[#17141b] py-4 text-sm tracking-[0.22em] hover:bg-[#8a6a19]" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#ddd3c1]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#fefbf6] px-4 text-[#7d7581]">OR</span>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-6 w-full rounded-none border-[#17141b] py-4 text-sm tracking-[0.22em]"
            onClick={() => signIn("google", { callbackUrl })}
          >
            Continue with Google
          </Button>
        </div>
      </div>
    </AuthPageShell>
  );
}
