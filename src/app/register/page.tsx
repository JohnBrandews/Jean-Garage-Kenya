"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <AuthPageShell
      title="Create your account"
      subtitle="Register with your email so your cart, orders, and delivery updates stay tied to one profile."
      footerText="Already have an account?"
      footerHref="/login"
      footerLinkLabel="Sign in"
    >
      <div>
        <div className="mb-8 rounded-[1.35rem] border border-[#e1d5c1] bg-[#f6f1e6] px-4 py-4">
          <p className="text-sm leading-6 text-[#5f5865]">
            Use a strong password and a valid email. You will use the same details to track your orders and receive
            updates.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input label="Full Name" placeholder="Your name" {...register("name")} error={errors.name?.message} />
          <Input label="Email" type="email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
          <Input label="Password" type="password" placeholder="Create a password" {...register("password")} error={errors.password?.message} />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="primary" className="w-full rounded-none bg-[#17141b] py-4 text-sm tracking-[0.22em] hover:bg-[#8a6a19]" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </AuthPageShell>
  );
}
