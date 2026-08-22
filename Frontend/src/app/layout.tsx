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
  metadataBase: new URL("https://cricoptions.com"),
  title: {
    default: "CricOptions | Cricket Prediction Strategy Game",
    template: "%s | CricOptions",
  },
  description:
    "Use CricCoins to make live cricket predictions, learn option-style strategy, replay match moments, and compete on matchday leaderboards without real money.",
  keywords: [
    "Cricket Options",
    "Cricket Prediction Game",
    "CricCoins",
    "Live Cricket Strategy",
    "Cricket Strategy Game",
    "Options Learning Game",
    "Cricket Analytics",
    "Matchday Leaderboard",
  ],
  authors: [{ name: "CricOptions Team" }],
  creator: "CricOptions",
  publisher: "CricOptions",
  icons: {
    icon: "/cricoptions_logo.jpg",
    apple: "/cricoptions_logo.jpg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cricoptions.com",
    siteName: "CricOptions",
    title: "CricOptions | Cricket Prediction Strategy Game",
    description:
      "Use CricCoins to make live cricket predictions, learn option-style strategy, and compete without real money.",
    images: [
      {
        url: "/cricoptions_logo.jpg",
        width: 1200,
        height: 630,
        alt: "CricOptions Matchday Strategy Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CricOptions | Cricket Prediction Strategy Game",
    description:
      "Use CricCoins to make live cricket predictions, learn strategy, and compete without real money.",
    images: ["/cricoptions_logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://cricoptions.com",
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
