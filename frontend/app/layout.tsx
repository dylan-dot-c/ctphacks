import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),

  title: {
    default: "PhishGuard | AI-Powered Phishing Detection",
    template: "%s | PhishGuard",
  },

  description:
    "Analyze suspicious emails, text messages, and online messages with AI. Get an instant phishing risk score, identify warning signs, and learn what actions to take next.",

  keywords: [
    "phishing detection",
    "scam detection",
    "AI phishing detector",
    "email scam detector",
    "text message scam detector",
    "cybersecurity",
    "online safety",
    "phishing checker",
    "scam checker",
    "Gemini AI",
  ],

  authors: [
    {
      name: "PhishGuard",
    },
  ],

  creator: "PhishGuard",
  publisher: "PhishGuard",

  applicationName: "PhishGuard",

  category: "technology",

  openGraph: {
    type: "website",
    url: defaultUrl,
    siteName: "PhishGuard",
    title: "PhishGuard | AI-Powered Phishing Detection",
    description:
      "Not sure if a message is a scam? Analyze suspicious messages with AI and receive an instant risk score, warning signs, and recommended actions.",
  },

  twitter: {
    card: "summary_large_image",
    title: "PhishGuard | AI-Powered Phishing Detection",
    description:
      "Analyze suspicious messages with AI and get an instant phishing risk score, warning signs, and recommended actions.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
