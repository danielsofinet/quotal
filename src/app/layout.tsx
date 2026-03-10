import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quotal.app"),
  title: {
    default: "Quotal — Compare vendor quotes in seconds",
    template: "%s | Quotal",
  },
  description:
    "Upload supplier quotes in any format — PDF, Excel, email — and get a side-by-side comparison in seconds. AI flags hidden fees automatically. Free to start.",
  keywords: [
    "compare supplier quotes online",
    "vendor quote comparison tool",
    "procurement quote analysis",
    "RFQ comparison software",
    "hidden fee detection",
    "AI procurement tool",
    "supplier quote management",
    "quote comparison tool for procurement",
    "compare vendor pricing",
    "procurement cost analysis",
    "supplier bid comparison",
    "RFQ analysis software",
  ],
  authors: [{ name: "Quotal" }],
  creator: "Quotal",
  publisher: "Quotal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Quotal — Compare vendor quotes in seconds",
    description:
      "Upload supplier quotes in any format and get a side-by-side comparison in seconds. AI flags hidden fees automatically. Free to start.",
    type: "website",
    siteName: "Quotal",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Quotal — AI-powered vendor quote comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quotal — Compare vendor quotes in seconds",
    description:
      "Upload supplier quotes in any format and get a side-by-side comparison in seconds. AI flags hidden fees automatically. Free to start.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#6C5CE7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={inter.variable}>
      <body className="antialiased bg-bg text-text-primary min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
