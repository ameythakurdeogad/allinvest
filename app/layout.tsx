import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "All-Invest — Personalised Financial Plans for Your Life",
  description: "Get a personalised insurance and wealth plan in 3 minutes. Free assessment, expert advice, no jargon.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
