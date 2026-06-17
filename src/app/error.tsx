"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="section-padding bg-white text-center">
      <div className="container-luxury max-w-lg mx-auto">
        <p className="text-8xl font-display font-bold text-red-600">500</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-charcoal">Something Went Wrong</h1>
        <p className="mt-4 text-gray-500">We&apos;re working to fix this. Please try again.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="primary" onClick={reset}>Try Again</Button>
          <Link href="/"><Button variant="secondary">Back to Home</Button></Link>
        </div>
      </div>
    </div>
  );
}
