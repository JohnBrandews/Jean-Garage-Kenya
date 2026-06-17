"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const HIDE_CHROME_PREFIXES = ["/admin"];
const HIDE_CHROME_PATHS = new Set(["/maintenance", "/login", "/register"]);

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideChrome =
    HIDE_CHROME_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || HIDE_CHROME_PATHS.has(pathname);

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
