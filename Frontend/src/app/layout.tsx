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
    default: "CricOptions | Live Cricket Options Trading & Analytics Platform",
    template: "%s | CricOptions",
  },
  description:
    "Trade live cricket Call options during T20 & ODI matches. Test option strategies, track real-time match depth, and rank on global leaderboards with virtual coins.",
  keywords: [
    "Cricket Options",
    "Cricket Derivatives",
    "Live Match Trading",
    "T20 Options Chain",
    "Virtual Options Simulator",
    "Options Trading Game",
    "Cricket Analytics",
    "Option Call Trading",
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
    title: "CricOptions | Social Live Cricket Options Trading",
    description:
      "Trade cricket Call options during live T20 and ODI matches. Test option strategies risk-free with virtual coins.",
    images: [
      {
        url: "/cricoptions_logo.jpg",
        width: 1200,
        height: 630,
        alt: "CricOptions Trading Terminal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CricOptions | Live Cricket Options Trading",
    description:
      "Trade cricket Call options during live T20 & ODI matches with virtual coins.",
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
