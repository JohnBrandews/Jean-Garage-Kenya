import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="section-padding bg-white">
          <div className="container-luxury mx-auto max-w-md">
            <div className="h-10 w-48 animate-pulse bg-light-gray" />
            <div className="mt-6 h-4 w-64 animate-pulse bg-light-gray" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
