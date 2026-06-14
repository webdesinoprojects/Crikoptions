import type { Metadata } from "next";
import { Montserrat, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TopNavBar from "@/components/TopNavBar";
import { SessionNavBar } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";

const montserrat = Montserrat({
  variable: "--font-display-xl",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-body-md",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-data-tabular",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${montserrat.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-[#000d1a] text-on-primary-container font-sans">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors closeButton position="top-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
