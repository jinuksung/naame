import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const BRAND_ICON_PATH = "/namefit-mark.svg";

export const metadata: Metadata = {
  title: "네임핏 | 우리 아이 이름 짓기",
  description: "무료 작명으로 예쁜 아이 이름 찾아가세요",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: BRAND_ICON_PATH,
    shortcut: BRAND_ICON_PATH,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <html lang="ko">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
