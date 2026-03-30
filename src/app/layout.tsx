import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "12ª Convenção YES!",
  description: "12ª Convenção YES!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
