import "./globals.css";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://resolvemun.in";
const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LesB7gtAAAAAPTHA-4HMMhWytZLAV0yE4Jd7OcJ";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Resolve MUN 2.0 | Hyderabad's Premier Model United Nations",
  description:
    "Resolve MUN 2.0 — Hyderabad's premier Model United Nations conference returns bigger and bolder. Secretariat Applications now open. Join the next evolution of diplomacy.",
  keywords: [
    "Resolve MUN 2.0",
    "resolve mun",
    "mun hyderabad",
    "model united nations hyderabad",
    "hyderabad mun",
    "MUN India",
    "student diplomacy",
    "Secretariat Applications",
    "Edition 2.0",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Resolve MUN 2.0 | Premier Model United Nations in Hyderabad",
    description:
      "Experience the next evolution of diplomacy at Resolve MUN 2.0. Secretariat Applications open now.",
    url: siteUrl,
    siteName: "Resolve MUN",
    images: [
      {
        url: "/images/OG.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resolve MUN 2.0 | Hyderabad's Premier Model United Nations",
    description:
      "Secretariat Applications open for Resolve MUN 2.0. Join student leaders in Hyderabad.",
    images: ["/images/OG.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@300;400;500;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Resolve MUN",
              url: siteUrl,
              logo: `${siteUrl}/images/L1.png`,
              sameAs: ["https://www.instagram.com/mun.resolve/"],
              description:
                "Hyderabad's premier Model United Nations conference — Resolve MUN 2.0",
            }),
          }}
        />
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
          strategy="afterInteractive"
        />
        </head>
      <body className="loaded" suppressHydrationWarning>
        {children}
        <Script src="/archive-script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
