import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Quotal — AI-Powered Vendor Quote Comparison",
  description:
    "Compare vendor quotes side-by-side with AI-powered extraction and normalization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-bg text-text-primary min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
