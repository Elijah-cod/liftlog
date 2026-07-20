import type { Metadata } from "next";

import { getAppUrl } from "@/lib/env";
import "./globals.css";

const appUrl = getAppUrl();

export const metadata: Metadata = {
  metadataBase: appUrl ?? undefined,
  title: {
    default: "LiftLog",
    template: "%s | LiftLog",
  },
  description: "Adaptive workout planning, progression guidance, exercise education, and training history.",
  applicationName: "LiftLog",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "LiftLog",
    description: "Adaptive workout planning, progression guidance, exercise education, and training history.",
    type: "website",
    siteName: "LiftLog",
  },
  twitter: {
    card: "summary",
    title: "LiftLog",
    description: "Adaptive workout planning, progression guidance, exercise education, and training history.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
