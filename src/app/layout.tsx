import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "12ª Convenção YES!",
  description: "12ª Convenção YES!",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <head>
        <meta name="robots" content="noindex" />
      </head>
      <body>{children}</body>
    </html>
  );
}
