import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Median News - See every story clearly.",
  description: "Political bias analysis for news articles. Compare how different sides frame the same story.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
      return (
        <html lang="en">
          <body className="antialiased bg-white">
            <Providers>
              <Navbar />
              <main className="min-h-screen">{children}</main>
            </Providers>
          </body>
        </html>
      );
}



