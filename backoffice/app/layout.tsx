import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pasion Balcanica — Backoffice",
    template: "%s · Pasion Balcanica",
  },
  description: "Admin panel for Pasion Balcanica walking tours in Sarajevo.",
  icons: {
    icon: "/logo-mark.svg",
    shortcut: "/logo-mark.svg",
    apple: "/logo-mark.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans text-brand-ink bg-surface-muted">
        {children}
      </body>
    </html>
  );
}
