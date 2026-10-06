import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeScript from "@/components/admin/ThemeScript";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Rio Online School | 1 සිට 11 ශ්‍රේණිය දක්වා Online School එකක්",
  description:
    "එකම මාසික ගාස්තුවකට සියලුම විෂයන්, Live Online Classes, Paper Classes සහ විභාග සූදානම් කිරීම. Grade 1-11 Sinhala & English Medium.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/*
          Must live in <head> of the root layout: it runs synchronously as the
          browser parses the HTML, before first paint, and is never re-rendered
          during client navigation. Only the admin area reads `data-theme`.
        */}
        <ThemeScript />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className="bg-background font-body-md text-on-background min-h-screen flex flex-col antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
