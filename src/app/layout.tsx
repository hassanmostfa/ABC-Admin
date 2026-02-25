import React from "react";
import type { Metadata } from "next";
import { Manrope, Cairo } from "next/font/google";
import "./css/globals.css";
import {ThemeModeScript, ThemeProvider } from "flowbite-react";
import customTheme from "@/utils/theme/custom-theme";
import { CustomizerContextProvider } from "@/app/context/CustomizerContext";
import { NotificationProvider } from "@/app/context/NotificationContext";
import "../utils/i18n";
import NextTopLoader from 'nextjs-toploader';
import { ReduxProvider } from "@/store/provider";

const manrope = Manrope({ subsets: ["latin"] });
const cairo = Cairo({ 
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "لوحة تحكم الإدارة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning >
      <head>
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        <ThemeModeScript />
      </head>
      <body className={`${manrope.className} ${cairo.variable}`} style={{ fontFamily: 'var(--font-cairo), Manrope, sans-serif' }} suppressHydrationWarning>
        <ReduxProvider>
          <NotificationProvider>
            <ThemeProvider theme={customTheme}>
              <NextTopLoader color="var(--color-primary)" />
              <CustomizerContextProvider>{children}</CustomizerContextProvider>
            </ThemeProvider>
          </NotificationProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
