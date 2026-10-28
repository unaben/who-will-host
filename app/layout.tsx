import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import ThemeToggle from "@/features/Theme/Theme";
import { themeInitScript } from "@/features/Theme/Theme.utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "Who will host?",
  description:
    "Plan events in groups, assign hosts and keep track of who is coming.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>  
        <ThemeToggle />      
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
