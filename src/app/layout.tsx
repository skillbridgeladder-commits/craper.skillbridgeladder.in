import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "Skill Scraper | Automated Google Maps Lead Generation",
    template: "%s | Skill Scraper",
  },
  description: "Extract business leads, WhatsApp numbers, emails & social media from Google Maps. Export to CSV/XLSX. Free Chrome extension by SkillBridge Ladder.",
  keywords: [
    "google maps scraper", "google maps data extractor", "lead generation tool",
    "whatsapp number extractor", "email finder", "business data scraper",
    "chrome extension scraper", "skill scraper", "google maps leads",
    "export google maps data", "scrape business contacts", "google maps email extractor",
    "free lead generation", "bulk whatsapp numbers", "google maps to excel",
    "business phone number extractor", "google maps crawler", "maps data export tool"
  ],
  authors: [{ name: "SkillBridge Ladder" }],
  creator: "SkillBridge Ladder",
  metadataBase: new URL("https://scraper.skillbridgeladder.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://scraper.skillbridgeladder.in",
    siteName: "Skill Scraper",
    title: "Skill Scraper | Automated Google Maps Lead Generation",
    description: "Extract business leads, WhatsApp numbers, emails & social media from Google Maps. Export to CSV/XLSX. Free Chrome extension.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Skill Scraper — Google Maps Lead Generation Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Scraper | Google Maps Lead Generation",
    description: "Extract business leads from Google Maps in seconds. Free Chrome extension.",
    images: ["/og-image.png"],
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "SoftwareApplication",
                  "name": "Skill Scraper",
                  "description": "Extract business leads, WhatsApp numbers, emails & social media from Google Maps. Export to CSV/XLSX.",
                  "url": "https://scraper.skillbridgeladder.in",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Chrome, Edge, Brave",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "INR"
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "ratingCount": "127",
                    "bestRating": "5"
                  },
                  "author": {
                    "@type": "Organization",
                    "name": "SkillBridge Ladder"
                  }
                },
                {
                  "@type": "Organization",
                  "name": "SkillBridge Ladder",
                  "url": "https://scraper.skillbridgeladder.in",
                  "logo": "https://scraper.skillbridgeladder.in/logo.png",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "email": "contact.skillbridgeladder@gmail.com",
                    "contactType": "customer service"
                  },
                  "sameAs": []
                },
                {
                  "@type": "WebSite",
                  "name": "Skill Scraper",
                  "url": "https://scraper.skillbridgeladder.in",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://scraper.skillbridgeladder.in/?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
        {/* Google AdSense Global Site Tag & Verification */}
        <meta name="google-adsense-account" content="ca-pub-5046331321616410" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5046331321616410" crossOrigin="anonymous"></script>
      </head>
      <body className="antialiased min-h-screen overflow-x-hidden">
        <ToastProvider>
          <AuthProvider>
            {/* Background FX */}
            <div className="bg-grid"></div>
            <div className="glow-orb glow-orb-1"></div>
            <div className="glow-orb glow-orb-2"></div>

            {/* Global Navbar */}
            <Navbar />

            {/* Page Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
              <main className="flex-1">
                {children}
              </main>

              {/* Global Footer */}
              <Footer />
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
