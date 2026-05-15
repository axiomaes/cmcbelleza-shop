import { fetchProducts, fetchCategories } from '@/lib/woocommerce';
import TiendaClient from '@/components/ui/TiendaClient';
import { Product, Category } from '@/types';
import { getDictionary } from '@/lib/get-dictionary';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // 10 minutes

interface TiendaPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TiendaPage({ params }: TiendaPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as any);
  
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [p, c] = await Promise.all([
      fetchProducts({ per_page: 100, lang: locale }),
      fetchCategories(locale),
    ]);
    products = p;
    categories = c;
  } catch (error) {
    console.error("Tienda Page Fetch Error:", error);
  }

  const isEn = locale === 'en';
  const heroText = {
    badge: isEn ? "The Full Collection" : "La Colección Completa",
    title: isEn ? "Handbags, Wigs & Accessories" : "Bolsos, Pelucas y Joyería",
    desc: isEn 
      ? "Explore our curated collection of high-quality women's fashion and premium accessories designed to enhance your daily style."
      : "Explora nuestra selección exclusiva de moda femenina premium y accesorios de alta calidad diseñados para potenciar tu estilo diario."
  };

  return (
    <div className="bg-background min-h-screen font-sans">
      {/* Hero de la Tienda */}
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-20 pb-12 text-center animate-in fade-in duration-700">
        <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] block mb-4">
          {heroText.badge}
        </span>
        <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 tracking-tight">
          {heroText.title}
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          {heroText.desc}
        </p>
      </section>

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-section-gap">
        <TiendaClient 
          initialProducts={products} 
          categories={categories} 
          dict={dict.store}
        />
      </main>
    </div>
  );
}