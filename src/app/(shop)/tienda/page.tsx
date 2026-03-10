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
    <div className="bg-base min-h-screen">
      {/* Hero de la Tienda */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center animate-in fade-in duration-700">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-dark mb-6">
          Catálogo <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">Completo</span>
        </h1>
        <p className="text-xl text-dark-muted max-w-2xl mx-auto font-medium leading-relaxed">
          Herramientas y cosmética de élite seleccionadas cuidadosamente para el éxito de tu negocio de belleza.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <TiendaClient initialProducts={products} categories={categories} />
      </main>
    </div>
  );
}