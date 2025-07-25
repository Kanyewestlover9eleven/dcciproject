// app/layout.tsx
import "./globals.css";               // your global styles here
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "dayak",
  description: "…",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
