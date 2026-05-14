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
    // Intento 1: Carga inicial con destacados e idioma solicitado
    const [prodRes, cmsRes] = await Promise.all([
      fetchProducts({ featured: true, per_page: 8, lang: locale }),
      getPageContent('home', locale)
    ]);
    products = prodRes;
    cmsData = cmsRes;

    // Fallback 1: Si no hay productos marcados como "destacados", cargar productos recientes
    if (products.length === 0) {
      console.warn(`[Home Page] No featured products found for "${locale}". Loading latest products as fallback.`);
      products = await fetchProducts({ per_page: 8, lang: locale });
    }

    // Fallback 2: Si sigue vacío, intentar cargar últimos productos sin filtro de idioma (para evitar Home vacía)
    if (products.length === 0) {
      console.warn(`[Home Page] No localized products found for "${locale}". Loading absolute latest products.`);
      products = await fetchProducts({ per_page: 8 });
    }
  } catch (error) {
    console.error("Home Page Async Fetch Error:", error);
  }

  const acf = cmsData?.acf || {};
  const isES = locale === 'es';

  // Resolviendo textos Hero Dinámicos con Fallbacks a Moda y Accesorios
  const heroTitle = acf.hero_title || (isES ? "Tu Estilo, Tu Esencia" : "Your Style, Your Essence");
  const heroSubtitle = acf.hero_subtitle || (isES 
    ? "Pelucas, bolsos, joyas y accesorios de belleza seleccionados para la mujer moderna" 
    : "Wigs, bags, jewelry and beauty accessories curated for the modern woman");
  const heroImage = acf.hero_image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=90";
  const heroCtaText = acf.hero_cta_text || (isES ? "Ver Colección" : "Shop Now");
  const heroCtaUrl = acf.hero_cta_url || `/${locale}/tienda`;

  // Resolviendo Características Dinámicas
  const feature1 = {
    icon: acf.feature_1?.feature_1_icon || "style",
    title: acf.feature_1?.feature_1_title || (isES ? "Moda y Belleza" : "Fashion & Beauty"),
    desc: acf.feature_1?.feature_1_desc || (isES ? "Todo lo que necesitas para expresar tu estilo en un solo lugar" : "Everything you need to express your style in one place")
  };
  const feature2 = {
    icon: acf.feature_2?.feature_2_icon || "local_shipping",
    title: acf.feature_2?.feature_2_title || (isES ? "Envío a USA" : "Fast US Shipping"),
    desc: acf.feature_2?.feature_2_desc || (isES ? "Entrega rápida en todo Estados Unidos e internacional" : "Quick delivery across the United States and internationally")
  };
  const feature3 = {
    icon: acf.feature_3?.feature_3_icon || "verified",
    title: acf.feature_3?.feature_3_title || (isES ? "Calidad Garantizada" : "Quality Guaranteed"),
    desc: acf.feature_3?.feature_3_desc || (isES ? "Productos seleccionados y verificados para asegurar tu satisfacción" : "Carefully selected and verified products for your satisfaction")
  };

  // Nuevas Categorías Reales (Moda y Cabello)
  const categories = [
    { id: 'wigs', name: isES ? 'Pelucas y Cabello' : 'Wigs & Hair', img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80', path: '/categoria/wigs' },
    { id: 'bags', name: isES ? 'Bolsos y Carteras' : 'Bags & Purses', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', path: '/categoria/bags' },
    { id: 'jewelry', name: isES ? 'Joyería y Relojes' : 'Jewelry & Watches', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', path: '/categoria/jewelry' },
    { id: 'clothing', name: isES ? 'Ropa y Tendencias' : 'Clothing & Trends', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', path: '/categoria/clothing' }
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
                  ? "Productos seleccionados bajo estrictos controles de calidad y estilo." 
                  : "Premium-selected products under strict quality and style control."
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
                ? "Selección rigurosa de prendas y accesorios que marcan tendencia en todo el mundo." 
                : "Rigorous selection of trending pieces and accessories worldwide."
              }
            </p>
          </div>
          
          <div className="w-full overflow-hidden">
            {products.length > 0 ? (
              <ProductSlider products={products} />
            ) : (
              <div className="text-center py-12 text-on-surface-variant/70 italic border border-dashed border-outline/30 rounded-2xl bg-surface-container-lowest">
                {isES ? "No se encontraron productos en este momento." : "No products found at this time."}
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

