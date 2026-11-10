import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers/Providers";
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
  title: {
    default: "Parle avec tes mains - Apprends la langue des signes française",
    template: "%s | Parle avec tes mains",
  },
  description:
    "Apprends l'alphabet de la langue des signes française (LSF) grâce à la reconnaissance en temps réel par webcam. Gratuit, sans inscription, 100% privé.",
  keywords: [
    "langue des signes française",
    "LSF",
    "apprentissage",
    "reconnaissance",
    "webcam",
    "gratuit",
    "accessibilité",
    "sourd",
    "malentendant",
    "alphabet dactylologique",
  ],
  authors: [{ name: "Maxime Martin" }],
  creator: "Maxime Martin",
  metadataBase: new URL("https://parle-avec-tes-mains.fr"),
  applicationName: "Parle avec tes mains",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LSF",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Parle avec tes mains - Apprends la langue des signes française",
    description:
      "Apprends l'alphabet LSF grâce à la reconnaissance en temps réel. Gratuit et 100% privé.",
    type: "website",
    locale: "fr_FR",
    url: "https://parle-avec-tes-mains.fr",
    siteName: "Parle avec tes mains",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parle avec tes mains",
    description: "Apprends la langue des signes française avec ta webcam",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#f97316" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
