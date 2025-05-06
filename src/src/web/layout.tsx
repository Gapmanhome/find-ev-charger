import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Find EV Charger Canada",
  description: "Live EV-charger map for Canadian drivers"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
