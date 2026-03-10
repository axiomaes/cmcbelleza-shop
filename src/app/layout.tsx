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
    default: "CMC Belleza - Equipamiento Profesional Premium",
    template: "%s | CMC Belleza",
  },
  description: "Herramientas y cosmética de élite para profesionales de la belleza. Resultados impecables desde el primer uso.",
  openGraph: {
    title: "CMC Belleza",
    description: "Equipamiento Profesional Premium para Salones de Belleza",
    url: "https://cmcbelleza.shop",
    siteName: "CMC Belleza",
    locale: "es_ES",
    type: "website",
  },
};

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
