import Link from 'next/link';
import Image from 'next/image';
import { fetchProducts } from '@/lib/woocommerce';
import Button from '@/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';
import ProductSlider from '@/components/ui/ProductSlider';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

export default async function Home() {
  let products: Product[] = [];
  try {
    products = await fetchProducts({ per_page: 12 });
  } catch (error) {
    console.error("Home Page Fetch Error:", error);
  }
  
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="w-full lg:w-1/2 text-center lg:text-left z-10 flex flex-col items-center lg:items-start animate-in fade-in slide-in-from-left-8 duration-700">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            🌿 Productos 100% Naturales
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-dark mb-6 leading-[1.1]">
            Tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">Belleza Natural</span>, al Mejor Precio
          </h1>

          <p className="text-lg md:text-xl text-dark-muted mb-8 max-w-xl font-medium">
            Descubre nuestra selección de cosméticos naturales, cremas, aceites y tratamientos para el cuidado diario. Porque cuidarte bien no tiene que ser complicado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/tienda">
              <Button variant="dark">Ver Productos</Button>
            </Link>
            <Link href="#product-slider">
              <Button variant="outline">Descubrir Más</Button>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 w-full flex justify-center lg:justify-start gap-8 md:gap-12">
            <div>
              <p className="text-2xl font-extrabold text-dark">🌿</p>
              <p className="text-sm text-dark-muted font-medium">Natural</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-dark">✨</p>
              <p className="text-sm text-dark-muted font-medium">Calidad Garantizada</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-dark text-secondary">🚚</p>
              <p className="text-sm text-dark-muted font-medium">Envío Rápido</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 relative z-10 mt-10 lg:mt-0 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="relative rounded-[2.5rem] overflow-hidden isolate shadow-2xl border-4 border-white/60 aspect-[4/5] sm:aspect-square lg:aspect-[4/5] transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500 group">
            <Image
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80"
              alt="Productos naturales de belleza CMC Belleza"
              width={600}
              height={700}
              className="object-cover transform group-hover:scale-105 transition-transform duration-1000"
              priority={true}
            />

            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-auto bg-white/80 backdrop-blur-md border border-white/50 p-4 rounded-2xl flex items-center gap-4 shadow-xl transform translate-y-0 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shrink-0 text-white">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-dark font-bold">🌿 100% Natural</p>
                <p className="text-sm text-dark-muted">Sin parabenos ni sulfatos</p>
              </div>
            </div>
          </div>

          <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </section>

      {/* Featured Products Slider */}
      <section id="product-slider" className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 overflow-visible mb-20 scroll-mt-24 min-h-[480px]">
        <ProductSlider products={featuredProducts} />
      </section>
    </div>
  );
}
