import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArigatoLoop",
  description: "自分の強みは、自分じゃわからない。だから誰かに書いてもらおう。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
