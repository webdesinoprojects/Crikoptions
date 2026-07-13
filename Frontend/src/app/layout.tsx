import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";

const spaceGroteskDisplay = Space_Grotesk({
  variable: "--font-display-xl",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGroteskBody = Space_Grotesk({
  variable: "--font-body-md",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-data-tabular",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CricOptions | Cricket Options Trading Terminal",
  description:
    "A professional cricket options trading workspace for live market data, execution, portfolio risk, and match intelligence.",
  icons: {
    icon: "/cricoptions_logo.jpg",
    apple: "/cricoptions_logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGroteskDisplay.variable} ${spaceGroteskBody.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-[100dvh] flex-col overflow-x-hidden bg-[#01040a] text-on-primary-container font-sans"
        suppressHydrationWarning
      >
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
