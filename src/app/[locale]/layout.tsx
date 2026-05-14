import type { Metadata } from "next";
import { Plus_Jakarta_Sans, EB_Garamond } from "next/font/google";
import "../../styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from 'next/script';

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const serif = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700", "800"],
});

import { getDictionary } from "@/lib/get-dictionary";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  // Fallback en caso de que locale sea indefinido
  const activeLocale = locale || 'es';
  const dict = await getDictionary(activeLocale as any);
  const meta = dict.metadata;

  return {
    title: {
      template: '%s | CMC Belleza',
      default: meta.title,
    },
    description: meta.description,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `https://cmcbelleza.shop/${activeLocale}`,
      siteName: 'CMC Belleza',
      locale: activeLocale === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
    },
    alternates: {
      canonical: `https://cmcbelleza.shop/${activeLocale}`,
      languages: {
        'es': 'https://cmcbelleza.shop/es',
        'en': 'https://cmcbelleza.shop/en',
        'x-default': 'https://cmcbelleza.shop/es'
      }
    },
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
      shortcut: '/favicon.ico',
    },
    verification: {
      google: 'KTu2Id1iutAeqDWrtuiDrtZY5Txa1kjQDeB0P-U_03Q'
    },
    manifest: '/site.webmanifest',
  };
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: Readonly<LayoutProps>) {
  const { locale } = await params;

  return (
    <html lang={locale || 'es'} className={`scroll-smooth ${sans.variable} ${serif.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-sans flex flex-col min-h-screen relative overflow-x-hidden selection:bg-primary-fixed selection:text-primary">
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <Header locale={locale || 'es'} />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer locale={locale || 'es'} />
      </body>
    </html>
  );
}
