import type { Metadata, Viewport } from "next";
import "@tabler/icons-webfont/dist/tabler-icons.css";
import "./globals.css";
import { AuthProvider } from "./providers";

export const metadata: Metadata = {
  title: "글로온 개념어앱",
  description: "개념어가 켜지는 중1 과학·사회 학습 앱",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
