import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "AREMS Capital Campaign — Building Naming Rights",
  description:
    "Interactive building blueprint for the AREMS capital campaign naming rights program.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-white antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
