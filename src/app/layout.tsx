import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { NativeProvider } from "@/components/layout/NativeProvider";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextNest — Your Personalized Relocation Plan",
  description:
    "Transform your move from chaos to confidence. Get a personalized relocation plan with timeline, budget guidance, and progress tracking.",
};

/** Root layout wrapping the entire application with fonts, auth, and providers. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <NativeProvider>
            <TooltipProvider>
              <MarketingLayout>{children}</MarketingLayout>
            </TooltipProvider>
          </NativeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
