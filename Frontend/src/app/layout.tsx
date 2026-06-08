import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import Providers from "@/components/Providers";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-display-xl",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body-md",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-data-tabular",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "PitchSide Pro Terminal | Professional Trading Workstation",
  description:
    "Bloomberg Terminal for sports markets — real-time player derivatives, market sentiment, and AI-powered trading intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#000d1a] text-on-primary-container overflow-hidden h-screen">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <TopNavBar />
            <div className="flex flex-1 overflow-hidden">
              <SideNavBar />
              <main className="flex-1 ml-60 mt-14 h-[calc(100vh-56px)] overflow-y-auto bg-[#00050d]">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
