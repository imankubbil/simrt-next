import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIM RT/RW | Sistem Informasi Manajemen RT/RW",
  description: "Sistem informasi pengelolaan data kependudukan dan administrasi RT/RW",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
