import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // This is the most important line

// Setup the primary font for the application
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Citizen Portaal",
  description: "Stakeholder Relationship Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}