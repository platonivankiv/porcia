import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Porcia",
  description: "Планирование питания для семьи",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body className="bg-white font-sans text-slate-900">{children}</body>
    </html>
  );
}
