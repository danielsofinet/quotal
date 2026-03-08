import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quotal — Compare vendor quotes in seconds",
  description:
    "AI-powered tool that extracts and compares supplier quotes from any format. Hidden fees flagged. Free to try.",
  openGraph: {
    title: "Quotal — Compare vendor quotes in seconds",
    description:
      "AI-powered tool that extracts and compares supplier quotes from any format. Hidden fees flagged. Free to try.",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark">
      <body className="antialiased bg-bg text-text-primary min-h-screen">
        {children}
      </body>
    </html>
  );
}
