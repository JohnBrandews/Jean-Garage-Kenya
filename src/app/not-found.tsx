import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="section-padding bg-white text-center">
      <div className="container-luxury max-w-lg mx-auto">
        <p className="text-8xl font-display font-bold gold-gradient-text">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-charcoal">Page Not Found</h1>
        <p className="mt-4 text-gray-500">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/" className="mt-8 inline-block">
          <Button variant="primary">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
