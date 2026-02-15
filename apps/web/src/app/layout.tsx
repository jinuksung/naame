import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "네임핏 | 우리 아이 이름 짓기",
  description: "무료 작명으로 예쁜 아이 이름 찾아가세요",
  icons: {
    icon: "/namefit-mark.svg",
    shortcut: "/namefit-mark.svg",
  },
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
