import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "네임핏 | 무료 작명 추천",
  description: "외부 웹 전용 네임핏 무료 작명 추천",
  verification: {
    google: "is91dFh-LIU76_RnaO5wWQvzcNZU1NYibUHwQ9URsJE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
