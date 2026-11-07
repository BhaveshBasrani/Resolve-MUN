import "./globals.css";
import "./sleek-modern.css";
import Script from "next/script";
import SmoothScroll from "@/components/SmoothScroll";
import DynamicIslandAlert from "@/components/DynamicIslandAlert";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://resolvemun.in";
const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LesB7gtAAAAAPTHA-4HMMhWytZLAV0yE4Jd7OcJ";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Resolve MUN 2.0 | 27–29 November 2026 · Meridian School, Kompally",
  description:
    "Resolve MUN 2.0 convenes on 27th–29th November 2026 at Meridian School, Kompally, Hyderabad. Register as an individual delegate, school delegation, Organizing Committee, or Secretariat High Command.",
  keywords: [
    "Resolve MUN 2.0",
    "Resolve MUN",
    "Resolve MUN 2026",
    "Resolve MUN dates",
    "Resolve MUN venue",
    "Meridian School Kompally MUN",
    "Meridian School Kompally",
    "Hyderabad MUN November 2026",
    "Model United Nations Hyderabad 2026",
    "MUN conferences in Hyderabad",
    "Best MUN in Telangana",
    "Delegate Registration Resolve MUN",
    "DISEC UNHRC UNSC Lok Sabha Committee X IP",
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
    title: "Resolve MUN 2.0 | 27–29 Nov 2026 · Meridian School, Kompally",
    description:
      "Join Hyderabad's premier Model United Nations conference on 27th–29th November 2026 at Meridian School, Kompally. Registrations open for Delegates, Delegations, OC & Secretariat.",
    url: siteUrl,
    siteName: "Resolve MUN 2026",
    images: [
      {
        url: "/images/OG.jpg",
        width: 1200,
        height: 630,
        alt: "Resolve MUN 2.0 — 27–29 November 2026 at Meridian School, Kompally, Hyderabad",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resolve MUN 2.0 | 27–29 Nov 2026 · Meridian School, Kompally",
    description:
      "Hyderabad's flagship MUN returns on 27–29 November 2026 at Meridian School, Kompally. 6 elite committees, ₹2.5 Lakhs in cash rewards. Register now.",
    images: ["/images/OG.jpg"],
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
                    "Resolve MUN 2.0 convenes on 27th–29th November 2026 at Meridian School, Kompally, Hyderabad. 6 elite committees (DISEC, UNHRC, UNSC, Lok Sabha, Committee X, IP), ₹2.5 Lakhs in cash rewards, and premier diplomatic simulations.",
                  startDate: "2026-11-27T08:30:00+05:30",
                  endDate: "2026-11-29T18:30:00+05:30",
                  eventStatus: "https://schema.org/EventScheduled",
                  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                  location: {
                    "@type": "Place",
                    name: "Meridian School, Kompally",
                    sameAs: "https://meridianschool.edu.in",
                    address: {
                      "@type": "PostalAddress",
                      streetAddress: "Kompally, Near Medchal Highway",
                      addressLocality: "Hyderabad",
                      addressRegion: "Telangana",
                      postalCode: "500014",
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
