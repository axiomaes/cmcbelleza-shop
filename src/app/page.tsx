import Link from 'next/link';
import Image from 'next/image';
import { fetchProducts } from '@/lib/woocommerce';
import ProductSlider from '@/components/ui/ProductSlider';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

const categories = [
  { id: 'cuidado-facial', name: 'Cuidado Facial', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', path: '/categoria/cuidado-facial' },
  { id: 'cuidado-corporal', name: 'Corporal', img: 'https://images.unsplash.com/photo-1564020426549-fabfb8c467ad?w=800&q=80', path: '/categoria/cuidado-corporal' },
  { id: 'serums-aceites', name: 'Sérums & Aceites', img: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&q=80', path: '/categoria/serums-aceites' },
  { id: 'tips-rutinas', name: 'Tips & Rutinas', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80', path: '/tips' }
];

export default async function Home() {
  let products: Product[] = [];
  try {
    products = await fetchProducts({ featured: true, per_page: 8 });
  } catch (error) {
    console.error("Home Page Fetch Error:", error);
  }

  return (
    <div className="flex flex-col w-full font-sans bg-background overflow-x-hidden">
      
      {/* Hero Editorial Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Subtle organic background blur */}
        <div className="absolute top-0 right-0 w-full md:w-2/3 h-full bg-surface-container-low -z-10 rounded-bl-[120px]"></div>
        
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-6 z-10 flex flex-col items-start animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <span className="text-secondary font-bold text-xs uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
              Rituales Conscientes
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-primary font-medium leading-[1.1] mb-8 tracking-tight">
              La ciencia pura del <br />
              <span className="italic">bienestar cutáneo.</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md mb-10 leading-relaxed font-medium">
              Fórmulas botánicas seleccionadas bajo rigurosos estándares de pureza, potenciando la salud innata de tu piel día a día.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/tienda" className="bg-primary text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/10 hover:bg-primary-container hover:-translate-y-0.5 transition-all">
                Explorar Tienda
              </Link>
              <Link href="/tips" className="border border-outline px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest text-on-surface hover:bg-white hover:border-primary transition-all">
                Ver Rutinas
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative mt-12 lg:mt-0 animate-in fade-in duration-1000 delay-300">
            <div className="relative aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl shadow-primary/5">
              <Image
                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&q=90"
                alt="Alta cosmética natural CMC Belleza"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>
            </div>
            {/* Floating abstract card */}
            <div className="absolute -bottom-6 -left-6 md:-left-12 bg-white/90 backdrop-blur-md p-6 rounded-xl border border-white/50 shadow-xl max-w-xs hidden sm:block animate-in slide-in-from-left-4 delay-700 fill-mode-both">
              <div className="flex items-center gap-3 text-secondary mb-2">
                <span className="material-symbols-outlined text-[32px]">eco</span>
                <h4 className="font-bold text-sm uppercase tracking-wider text-primary">Eco-Certified</h4>
              </div>
              <p className="text-on-surface-variant text-sm">Ingredientes orgánicos de origen sostenible y trazabilidad garantizada.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Carousel/Grid Section */}
      <section className="py-20 bg-white">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
            <div>
              <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] block mb-2">Selección Esencial</span>
              <h2 className="font-serif text-3xl md:text-4xl text-primary">Categorías Destacadas</h2>
            </div>
            <Link href="/tienda" className="text-sm font-bold uppercase tracking-wider text-primary hover:text-secondary transition-colors flex items-center gap-1">
              Ver todo el catálogo <span className="material-symbols-outlined text-[18px]">trending_flat</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {categories.map((cat) => (
              <Link key={cat.id} href={cat.path} className="group flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low mb-4">
                  <Image 
                    src={cat.img} 
                    alt={cat.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
                </div>
                <h3 className="font-serif text-xl text-on-surface group-hover:text-primary transition-colors font-medium">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="product-slider" className="py-20 bg-surface-container-low">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] block mb-2">Lo Más Vendido</span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary mb-4">Favoritos de la Comunidad</h2>
            <p className="text-on-surface-variant">Selección rigurosa de los productos que están transformando rutinas en todo el mundo.</p>
          </div>
          
          <div className="w-full overflow-hidden">
            {products.length > 0 ? (
              <ProductSlider products={products} />
            ) : (
              <div className="text-center py-12 text-on-surface-variant italic">
                Cargando selección...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value proposition banner */}
      <section className="py-24 bg-primary text-surface-container-lowest relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] pointer-events-none"></div>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 text-center">
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[48px] text-secondary-fixed mb-4">verified</span>
            <h4 className="font-serif text-2xl mb-2">Selección Experta</h4>
            <p className="text-white/70 text-sm font-medium">Curaduría rigurosa de fórmulas que fusionan botánica pura y biotecnología para resultados reales.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[48px] text-secondary-fixed mb-4">spa</span>
            <h4 className="font-serif text-2xl mb-2">Bienestar Filtrado</h4>
            <p className="text-white/70 text-sm font-medium">Rastreamos el mercado global buscando pureza e integridad. Acercamos cosmética limpia, sin tóxicos.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[48px] text-secondary-fixed mb-4">local_shipping</span>
            <h4 className="font-serif text-2xl mb-2">Logística Directa</h4>
            <p className="text-white/70 text-sm font-medium">Conexión optimizada con proveedores verificados para envíos ágiles reduciendo pasos intermedios.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
