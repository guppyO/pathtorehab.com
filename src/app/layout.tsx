import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pathtorehab.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Path To Rehab - Find Addiction & Mental Health Treatment Centers',
    template: '%s | Path To Rehab',
  },
  description: 'Find drug rehab, alcohol treatment, and mental health facilities near you. Browse 15,000+ SAMHSA-verified treatment centers with verified services, payment options, and contact information.',
  keywords: [
    'drug rehab',
    'alcohol rehab',
    'addiction treatment',
    'mental health treatment',
    'rehab near me',
    'substance abuse treatment',
    'detox centers',
    'outpatient treatment',
    'inpatient rehab',
  ],
  authors: [{ name: 'Path To Rehab' }],
  creator: 'Path To Rehab',
  publisher: 'Path To Rehab',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Path To Rehab',
    title: 'Path To Rehab - Find Addiction & Mental Health Treatment Centers',
    description: 'Find drug rehab, alcohol treatment, and mental health facilities near you. Browse 15,000+ SAMHSA-verified treatment centers.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Path To Rehab - Find Addiction & Mental Health Treatment Centers',
    description: 'Find drug rehab, alcohol treatment, and mental health facilities near you.',
  },
  verification: {
    google: 'GxTgzHZJvtnmv83aas_WTuwCMMzOdvD7Qan-yHkJBb4',
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1226435955298586"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
