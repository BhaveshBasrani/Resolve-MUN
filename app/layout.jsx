import "./globals.css";
import "./sleek-modern.css";
import Script from "next/script";
import SmoothScroll from "@/components/SmoothScroll";
import DynamicIslandAlert from "@/components/DynamicIslandAlert";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://resolvemun.in";
const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LesB7gtAAAAAPTHA-4HMMhWytZLAV0yE4Jd7OcJ";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Resolve MUN 2.0 | 25, 26, 27 December 2026 · TBA",
  description:
    "Resolve MUN 2.0 convenes on 25, 26, 27 December 2026 in Hyderabad (Venue: TBA - To Be Announced). Register as an individual delegate, school delegation, Organizing Committee, or Secretariat High Command.",
  keywords: [
    "Resolve MUN 2.0",
    "Resolve MUN",
    "Resolve MUN 2026",
    "Resolve MUN dates",
    "Resolve MUN venue",
    "Hyderabad MUN December 2026",
    "Model United Nations Hyderabad 2026",
    "MUN conferences in Hyderabad",
    "Best MUN in Telangana",
    "Delegate Registration Resolve MUN",
    "DISEC UNHRC UNCSW Lok Sabha IPL IP",
    "student diplomacy India",
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
    title: "Resolve MUN 2.0 | 25, 26, 27 Dec 2026 · TBA",
    description:
      "Join Hyderabad's premier Model United Nations conference on 25, 26, 27 December 2026. Venue TBA (To Be Announced). Registrations open for Delegates, Delegations, OC & Secretariat.",
    url: siteUrl,
    siteName: "Resolve MUN 2026",
    images: [
      {
        url: `${siteUrl}/images/OG.jpg`,
        secureUrl: `${siteUrl}/images/OG.jpg`,
        width: 1024,
        height: 576,
        type: "image/jpeg",
        alt: "Resolve MUN 2.0 — Resolve, Reform, Reconcile | 25, 26, 27 December 2026",
      },
      {
        url: `${siteUrl}/OG.jpg`,
        secureUrl: `${siteUrl}/OG.jpg`,
        width: 1024,
        height: 576,
        type: "image/jpeg",
        alt: "Resolve MUN 2.0 — Official Banner",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resolve MUN 2.0 | 25, 26, 27 Dec 2026 · TBA",
    description:
      "Hyderabad's flagship MUN returns on 25, 26, 27 December 2026. Venue TBA (To Be Announced). 6 elite committees, ₹2.5 Lakhs in cash rewards. Register now.",
    images: [`${siteUrl}/images/OG.jpg`],
  },
  alternates: {
    canonical: siteUrl,
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
        {/* Explicit High-Reliability OG & Twitter Meta Tags for WhatsApp, iMessage, Telegram, Discord, LinkedIn, X */}
        <meta property="og:image" content={`${siteUrl}/images/OG.jpg`} />
        <meta property="og:image:secure_url" content={`${siteUrl}/images/OG.jpg`} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="576" />
        <meta property="og:image:alt" content="Resolve MUN 2.0 — Resolve, Reform, Reconcile" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${siteUrl}/images/OG.jpg`} />
        <meta name="twitter:image:alt" content="Resolve MUN 2.0 — Resolve, Reform, Reconcile" />
        
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@300;400;500;600;700&family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@800;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Event",
                  "@id": `${siteUrl}/#event`,
                  name: "Resolve MUN 2.0 — Hyderabad's Flagship Model United Nations",
                  description:
                    "Resolve MUN 2.0 convenes on 25, 26, 27 December 2026 in Hyderabad. Venue TBA (To Be Announced). 6 elite committees (UNCSW, UNHRC, DISEC, IP, Lok Sabha, IPL), ₹2.5 Lakhs in cash rewards, and premier diplomatic simulations.",
                  startDate: "2026-12-25T08:30:00+05:30",
                  endDate: "2026-12-27T18:30:00+05:30",
                  eventStatus: "https://schema.org/EventScheduled",
                  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                  location: {
                    "@type": "Place",
                    name: "TBA (To Be Announced)",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: "Hyderabad",
                      addressRegion: "Telangana",
                      addressCountry: "IN",
                    },
                  },
                  image: [
                    `${siteUrl}/images/OG.jpg`,
                    `${siteUrl}/images/L1.png`,
                    `${siteUrl}/images/Venue.svg`,
                  ],
                  organizer: {
                    "@type": "Organization",
                    name: "Resolve MUN Secretariat",
                    url: siteUrl,
                    logo: `${siteUrl}/images/L1.png`,
                  },
                  offers: {
                    "@type": "AggregateOffer",
                    lowPrice: "1500",
                    highPrice: "2500",
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                    validFrom: "2026-01-01",
                    url: `${siteUrl}/register`,
                  },
                },
                {
                  "@type": "Organization",
                  "@id": `${siteUrl}/#organization`,
                  name: "Resolve MUN",
                  url: siteUrl,
                  logo: `${siteUrl}/images/L1.png`,
                  sameAs: ["https://www.instagram.com/mun.resolve/"],
                  description:
                    "Hyderabad's premier student-led Model United Nations conference organization.",
                },
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}/#website`,
                  url: siteUrl,
                  name: "Resolve MUN 2026",
                  publisher: {
                    "@id": `${siteUrl}/#organization`,
                  },
                },
              ],
            }),
          }}
        />
        </head>
      <body className="loaded" suppressHydrationWarning>
        <DynamicIslandAlert />
        <SmoothScroll />
        {children}
        <Script src="/archive-script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
