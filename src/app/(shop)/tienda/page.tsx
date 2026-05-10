import { fetchProducts, fetchCategories } from '@/lib/woocommerce';
import TiendaClient from '@/components/ui/TiendaClient';
import { Product, Category } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // 10 minutes

export default async function TiendaPage() {
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [p, c] = await Promise.all([
      fetchProducts({ per_page: 100 }),
      fetchCategories(),
    ]);
    products = p;
    categories = c;
  } catch (error) {
    console.error("Tienda Page Fetch Error:", error);
  }

  return (
    <div className="bg-background min-h-screen font-sans">
      {/* Hero de la Tienda */}
      <section className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-20 pb-12 text-center animate-in fade-in duration-700">
        <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] block mb-4">La Colección Completa</span>
        <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 tracking-tight">
          Farmacopea Botánica
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Explora nuestra curaduría experta de activos naturales diseñados para restaurar la vitalidad natural de tu piel.
        </p>
      </section>

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-section-gap">
        <TiendaClient initialProducts={products} categories={categories} />
      </main>
    </div>
  );
}