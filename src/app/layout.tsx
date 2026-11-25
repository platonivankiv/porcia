import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "@/app/globals.css";

const bodyFont = localFont({
  src: [
    { path: "./fonts/body-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/body-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/body-600.ttf", weight: "600", style: "normal" },
    { path: "./fonts/body-700.ttf", weight: "700", style: "normal" },
    { path: "./fonts/body-800.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});
const displayFont = localFont({
  src: "./fonts/display-bold.ttf",
  weight: "700",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Porcia",
  description: "Планирование питания для семьи",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}
