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
  title: "Best MUN in Hyderabad | Resolve MUN 2.0 (25–27 Dec 2026)",
  description:
    "Looking for the best MUN in Hyderabad? Resolve MUN 2.0 convenes on 25, 26, 27 December 2026. 6 top committees (UNCSW, UNHRC, DISEC, IP, Lok Sabha, IPL), ₹2.5 Lakhs in cash prizes, and executive passes. Register your delegate pass today!",
  keywords: [
    "Best MUN in Hyderabad",
    "best mun in hyderabad",
    "Top MUN in Hyderabad",
    "Best Model United Nations Hyderabad",
    "MUN in Hyderabad December 2026",
    "Model United Nations Hyderabad 2026",
    "Hyderabad MUN conferences 2026",
    "Resolve MUN 2.0",
    "Resolve MUN",
    "best mun for beginners hyderabad",
    "best school mun in hyderabad",
    "best college mun hyderabad",
    "UNCSW UNHRC DISEC IP Lok Sabha IPL",
    "Resolve MUN dates",
    "Resolve MUN venue",
    "student diplomacy Hyderabad",
    "Telangana Model United Nations",
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
    title: "Best MUN in Hyderabad | Resolve MUN 2.0 (25–27 Dec 2026)",
    description:
      "Looking for the best MUN in Hyderabad? Join Resolve MUN 2.0 on 25, 26, 27 December 2026. 6 top committees, ₹2.5 Lakhs in cash prizes, and beginner-friendly executive boards. Register now!",
    url: siteUrl,
    siteName: "Resolve MUN 2.0 — Best MUN in Hyderabad",
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
    title: "Best MUN in Hyderabad | Resolve MUN 2.0 (25–27 Dec 2026)",
    description:
      "Looking for the best MUN in Hyderabad? Resolve MUN 2.0 happens on 25, 26, 27 December 2026. 6 elite committees, ₹2.5 Lakhs in cash rewards. Register your delegate pass today!",
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
        {/* Geographic & City Specific Local SEO for Google and Bing */}
        <meta name="geo.region" content="IN-TG" />
        <meta name="geo.placename" content="Hyderabad" />
        <meta name="geo.position" content="17.385044;78.486671" />
        <meta name="ICBM" content="17.385044, 78.486671" />
        <meta name="city" content="Hyderabad" />
        <meta name="country" content="India" />

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
                  name: "Resolve MUN 2.0 — Best MUN in Hyderabad",
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
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "4.9",
                    reviewCount: "220",
                    bestRating: "5",
                  },
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
                  name: "Resolve MUN 2.0 — Best MUN in Hyderabad",
                  publisher: {
                    "@id": `${siteUrl}/#organization`,
                  },
                },
                {
                  "@type": "BreadcrumbList",
                  "@id": `${siteUrl}/#breadcrumbs`,
                  itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
                    { "@type": "ListItem", position: 2, name: "Best MUN in Hyderabad", item: `${siteUrl}/#faq` },
                    { "@type": "ListItem", position: 3, name: "Register", item: `${siteUrl}/register` },
                  ],
                },
                {
                  "@type": "FAQPage",
                  "@id": `${siteUrl}/#faq`,
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "What is the best MUN in Hyderabad?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Resolve MUN 2.0 is rated among the best MUNs in Hyderabad. It brings together over 500 delegates across 6 committees (UNCSW, UNHRC, DISEC, International Press, Lok Sabha, and IPL Auction) on 25, 26, and 27 December 2026 with ₹2,50,000 in cash prizes.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "When and where is Resolve MUN 2.0 happening?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Resolve MUN 2.0 takes place on 25, 26, and 27 December 2026 in Hyderabad. The venue will be announced soon (TBA) with complete travel and parking details.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Can beginners participate in Resolve MUN 2.0?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Resolve MUN is 100% beginner-friendly. Every delegate receives background study guides, rules of procedure training, and fair guidance from the Executive Board.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "What committees are available at Resolve MUN 2.0?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "The 6 committees are UNCSW (Women's Rights), UNHRC (Human Rights), DISEC (Disarmament & Security), International Press (IP), Lok Sabha (Indian Parliament), and IPL Auction.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "What are the cash prizes at Resolve MUN 2.0?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Resolve MUN 2.0 offers ₹2,50,000 in total cash prizes across all committees, along with official Best Delegate, High Commendation, and Special Mention trophies and certificates.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "How do I register for Resolve MUN 2.0?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "You can register directly on resolvemun.in as an individual delegate or with your school delegation. Instant digital entry passes with secure QR codes are issued upon registration.",
                      },
                    },
                  ],
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
