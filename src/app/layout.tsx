import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrepOne | Creperie Boutique",
  description: "Crepes, waffles, croffles and milkshakes in Gatineau.",
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
