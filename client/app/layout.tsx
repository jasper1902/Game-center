import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Games center",
  description: "online multiplayer games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50">{children}</body>
    </html>
  );
}
