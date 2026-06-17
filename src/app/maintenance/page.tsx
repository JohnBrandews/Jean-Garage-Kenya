import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal text-white text-center px-6">
      <div className="max-w-lg">
        <h1 className="font-display text-5xl font-bold">
          JEANS GARAGE
        </h1>
        <p className="mt-6 text-xl text-gray-400">We&apos;re currently undergoing maintenance.</p>
        <p className="mt-2 text-gray-500">We&apos;ll be back shortly with something amazing.</p>
        <Link href="/" className="mt-8 inline-block">
          <Button variant="gold">Check Status</Button>
        </Link>
      </div>
    </div>
  );
}
