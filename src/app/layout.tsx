import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: '%s | CMC Belleza',
    default: 'CMC Belleza — Productos Naturales y Belleza',
  },
  description: 'Descubre nuestra selección de cosméticos naturales, \
cremas, aceites y tratamientos para el cuidado diario.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`scroll-smooth ${inter.variable}`}>
      <body className="bg-base text-dark font-sans flex flex-col min-h-screen relative overflow-x-hidden">
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/50 to-transparent -z-10 pointer-events-none"></div>
        
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}
