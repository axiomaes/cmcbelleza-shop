import Link from 'next/link';
import Image from 'next/image';
import { fetchProducts } from '@/lib/woocommerce';
import ProductSlider from '@/components/ui/ProductSlider';
import { Product } from '@/types';
import { getPageContent } from '@/lib/cms';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  
  let products: Product[] = [];
  let cmsData = null;

  try {
    const [prodRes, cmsRes] = await Promise.all([
      fetchProducts({ featured: true, per_page: 8, lang: locale }),
      getPageContent('home', locale)
    ]);
    products = prodRes;
    cmsData = cmsRes;
  } catch (error) {
    console.error("Home Page Async Fetch Error:", error);
  }

  const acf = cmsData?.acf || {};
  const isES = locale === 'es';

  // Resolviendo textos Hero Dinámicos con Fallbacks a Beauty Accessories
  const heroTitle = acf.hero_title || (isES ? "Tu Kit de Belleza Perfecto" : "Your Perfect Beauty Kit");
  const heroSubtitle = acf.hero_subtitle || (isES 
    ? "Descubre nuestra colección de brochas, esponjas y herramientas profesionales para un maquillaje impecable" 
    : "Discover our collection of professional brushes, sponges and tools for flawless makeup");
  const heroImage = acf.hero_image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=90";
  const heroCtaText = acf.hero_cta_text || (isES ? "Ver Colección" : "Shop Now");
  const heroCtaUrl = acf.hero_cta_url || `/${locale}/tienda`;

  // Resolviendo Características Dinámicas
  const feature1 = {
    icon: acf.feature_1?.feature_1_icon || "brush",
    title: acf.feature_1?.feature_1_title || (isES ? "Calidad Profesional" : "Professional Quality"),
    desc: acf.feature_1?.feature_1_desc || (isES ? "Herramientas usadas por maquilladores profesionales al alcance de todos" : "Tools used by professional makeup artists available for everyone")
  };
  const feature2 = {
    icon: acf.feature_2?.feature_2_icon || "spa",
    title: acf.feature_2?.feature_2_title || (isES ? "Suave con tu Piel" : "Gentle on Your Skin"),
    desc: acf.feature_2?.feature_2_desc || (isES ? "Materiales de alta calidad que cuidan tu piel mientras te maquillas" : "High quality materials that care for your skin while you apply makeup")
  };
  const feature3 = {
    icon: acf.feature_3?.feature_3_icon || "local_shipping",
    title: acf.feature_3?.feature_3_title || (isES ? "Envío a USA" : "Fast US Shipping"),
    desc: acf.feature_3?.feature_3_desc || (isES ? "Entrega rápida en todo Estados Unidos y envíos internacionales disponibles" : "Quick delivery across the United States with international shipping available")
  };

  // Nuevas Categorías Reales (Accesorios de Belleza)
  const categories = [
    { id: 'brushes', name: isES ? 'Brochas' : 'Brushes', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80', path: '/categoria/brushes' },
    { id: 'sponges', name: isES ? 'Esponjas y Aplicadores' : 'Sponges & Applicators', img: 'https://images.unsplash.com/photo-1583241475879-da37a892d74e?w=800&q=80', path: '/categoria/sponges' },
    { id: 'sets-kits', name: isES ? 'Sets y Kits' : 'Sets & Kits', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', path: '/categoria/sets-kits' },
    { id: 'tips-rutinas', name: isES ? 'Guías y Tips' : 'Guides & Tips', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80', path: '/tips' }
  ];

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
              {isES ? "Accesorios de Tendencia" : "Trending Accessories"}
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-primary font-medium leading-[1.1] mb-8 tracking-tight">
              {heroTitle}
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md mb-10 leading-relaxed font-medium">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={heroCtaUrl} className="bg-primary text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/10 hover:bg-primary-container hover:-translate-y-0.5 transition-all">
                {heroCtaText}
              </Link>
              <Link href={`/${locale}/tips`} className="border border-outline px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest text-on-surface hover:bg-white hover:border-primary transition-all">
                {isES ? "Ver Guías" : "View Guides"}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative mt-12 lg:mt-0 animate-in fade-in duration-1000 delay-300">
            <div className="relative aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl shadow-primary/5 bg-gray-100">
              <Image
                src={heroImage}
                alt={heroTitle}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>
            </div>
            {/* Floating abstract card */}
            <div className="absolute -bottom-6 -left-6 md:-left-12 bg-white/90 backdrop-blur-md p-6 rounded-xl border border-white/50 shadow-xl max-w-xs hidden sm:block animate-in slide-in-from-left-4 delay-700 fill-mode-both">
              <div className="flex items-center gap-3 text-secondary mb-2">
                <span className="material-symbols-outlined text-[32px]">verified</span>
                <h4 className="font-bold text-sm uppercase tracking-wider text-primary">Premium Grade</h4>
              </div>
              <p className="text-on-surface-variant text-sm">
                {isES 
                  ? "Herramientas seleccionadas bajo estrictos controles de calidad profesional." 
                  : "Premium-selected tools under strict professional quality control."
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Carousel/Grid Section */}
      <section className="py-20 bg-white">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
            <div>
              <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] block mb-2">
                {isES ? "Selección Esencial" : "Essential Selection"}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-primary">
                {isES ? "Categorías Destacadas" : "Featured Categories"}
              </h2>
            </div>
            <Link href={`/${locale}/tienda`} className="text-sm font-bold uppercase tracking-wider text-primary hover:text-secondary transition-colors flex items-center gap-1">
              {isES ? "Ver todo el catálogo" : "Shop Full Collection"}{" "}
              <span className="material-symbols-outlined text-[18px]">trending_flat</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${locale}${cat.path}` as any} className="group flex flex-col">
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
            <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] block mb-2">
              {isES ? "Lo Más Vendido" : "Top Sellers"}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary mb-4">
              {isES ? "Favoritos de la Comunidad" : "Community Favorites"}
            </h2>
            <p className="text-on-surface-variant">
              {isES 
                ? "Selección rigurosa de las herramientas que están transformando acabados en todo el mundo." 
                : "Rigorous selection of tools transforming finishes worldwide."
              }
            </p>
          </div>
          
          <div className="w-full overflow-hidden">
            {products.length > 0 ? (
              <ProductSlider products={products} />
            ) : (
              <div className="text-center py-12 text-on-surface-variant italic">
                {isES ? "Cargando selección..." : "Loading selection..."}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value proposition banner (Dynamic via Feature Blocks) */}
      <section className="py-24 bg-primary text-surface-container-lowest relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] pointer-events-none"></div>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 text-center">
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[48px] text-secondary-fixed mb-4">{feature1.icon}</span>
            <h4 className="font-serif text-2xl mb-2">{feature1.title}</h4>
            <p className="text-white/70 text-sm font-medium">{feature1.desc}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[48px] text-secondary-fixed mb-4">{feature2.icon}</span>
            <h4 className="font-serif text-2xl mb-2">{feature2.title}</h4>
            <p className="text-white/70 text-sm font-medium">{feature2.desc}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="material-symbols-outlined text-[48px] text-secondary-fixed mb-4">{feature3.icon}</span>
            <h4 className="font-serif text-2xl mb-2">{feature3.title}</h4>
            <p className="text-white/70 text-sm font-medium">{feature3.desc}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

