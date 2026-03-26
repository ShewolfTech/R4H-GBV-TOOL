import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionProvider from "@/components/ui/SessionProvider";
import SafetyExit from "@/components/ui/SafetyExit";

export const metadata: Metadata = {
  title: "Rights 4 Her Uganda — GBV Reporting Tool",
  description: "Safe, confidential documentation tool for gender-based violence incidents.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "R4H GBV Tool" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#7bdcb5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <SafetyExit />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
