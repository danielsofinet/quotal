import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
    "AI-powered tool that extracts and compares supplier quotes from any format. Hidden fees flagged. Free to try.",
  keywords: [
    "vendor quote comparison",
    "procurement software",
    "supplier quote analysis",
    "RFQ comparison",
    "hidden fee detection",
    "AI procurement",
    "purchasing management",
    "quote management tool",
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
      "AI-powered tool that extracts and compares supplier quotes from any format. Hidden fees flagged. Free to try.",
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
      "AI-powered tool that extracts and compares supplier quotes from any format. Hidden fees flagged. Free to try.",
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
      </body>
    </html>
  );
}
