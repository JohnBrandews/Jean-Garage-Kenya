import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { SiteShell } from "@/components/layout/site-shell";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JEANS GARAGE | Premium Fashion Since 2015",
    template: "%s | JEANS GARAGE",
  },
  description:
    "Luxury streetwear and premium fashion. Shop jeans, clothing, footwear, and accessories. Delivering across Kenya, East Africa, and worldwide.",
  keywords: ["JEANS GARAGE", "jeans", "fashion", "Kenya", "streetwear", "luxury", "clothing"],
  icons: {
    icon: "/jean.png",
    shortcut: "/jean.png",
    apple: "/jean.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <CartProvider>
            <SiteShell>{children}</SiteShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
