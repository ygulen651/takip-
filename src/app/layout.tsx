import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ugi Takip",
  description: "Görev ve iş takip sistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}

