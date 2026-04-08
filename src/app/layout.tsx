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
  description: "Daily workout execution and logging for the web.",
  applicationName: "LiftLog",
  openGraph: {
    title: "LiftLog",
    description: "Daily workout execution and logging for the web.",
    type: "website",
    siteName: "LiftLog",
  },
  twitter: {
    card: "summary",
    title: "LiftLog",
    description: "Daily workout execution and logging for the web.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
