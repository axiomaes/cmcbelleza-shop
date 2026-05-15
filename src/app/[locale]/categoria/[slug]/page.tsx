import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCategoryBySlug, fetchProducts } from '@/lib/woocommerce';
import { Product } from '@/types';
import ProductSlider from '@/components/ui/ProductSlider';
import Button from '@/components/ui/Button';
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

// Default fallbacks in case images/descriptions are missing from WooCommerce API
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80';

// Subtitles mapping per category for a richer UI, with dynamic fallback
const CATEGORY_SUBTITLES: Record<string, Record<string, string>> = {
  'wigs': {
    es: 'Pelucas y Extensiones de calidad premium para transformar tu look.',
    en: 'Premium quality wigs and extensions to transform your look.'
  },
  'bags': {
    es: 'Bolsos exclusivos diseñados para complementar cada momento de tu día.',
    en: 'Exclusive handbags designed to complement every moment of your day.'
  },
  'jewelry': {
    es: 'Brilla con nuestra curación de joyería y bisutería fina.',
    en: 'Shine with our curated selection of fine jewelry.'
  },
  'clothing': {
    es: 'Prendas seleccionadas que definen tendencia y estilo.',
    en: 'Selected garments that define trend and style.'
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  
  try {
    const category = await fetchCategoryBySlug(slug, locale);
    if (!category) return { title: 'Categoría | CMC Belleza' };

    return {
      title: `${category.name} | CMC Belleza`,
      description: category.description || `Explora la colección de ${category.name} en CMC Belleza.`,
    };
  } catch (err) {
    return { title: 'Categoría | CMC Belleza' };
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug, locale } = await params;
  const isES = locale === 'es';

  // 1. Fetch WooCommerce Category dynamically
  let wpCategory = null;
  try {
    wpCategory = await fetchCategoryBySlug(slug, locale);
  } catch (err) {
    console.error(`Error fetching category data for: ${slug}`, err);
  }

  if (!wpCategory) {
    notFound();
  }

  // 2. Fetch Products in Category
  let products: Product[] = [];
  try {
    products = await fetchProducts({ 
      category: wpCategory.id.toString(), 
      per_page: 8, 
      lang: locale 
    });
  } catch (err) {
    console.error(`Error fetching products for category ID: ${wpCategory.id}`, err);
  }

  // 3. Build display variables
  const title = wpCategory.name;
  const desc = wpCategory.description || '';
  const imageSrc = wpCategory.image?.src || FALLBACK_IMAGE;
  
  const customSub = CATEGORY_SUBTITLES[slug]?.[locale];
  const subtitle = customSub || (isES ? 'Esenciales seleccionados para la mujer moderna' : 'Curated essentials for the modern woman');

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50/30">
      
      {/* Immersive Hero Sector */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={imageSrc} 
            alt={title} 
            fill 
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-50/30"></div>
        </div>
        
        <ParallaxBackground />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center animate-in slide-in-from-bottom-10 duration-1000">
          <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> {isES ? 'Edición Especial' : 'Special Edition'}
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-xl tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl drop-shadow-md">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Description Section */}
      {desc && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 -mt-20 relative z-20">
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-xl p-8 md:p-12 lg:p-16 flex flex-col gap-12 items-center">
            
            <div className="w-full text-center max-w-3xl flex flex-col gap-6">
              <h2 className="text-3xl font-bold text-dark mb-2">{isES ? 'Filosofía de Estilo' : 'Style Philosophy'}</h2>
              <p className="text-lg text-dark-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }} />
              
              <div className="mt-4 justify-center flex">
                <Link href={`/${locale}/tienda?category=${wpCategory.id}`}>
                  <Button variant="dark" className="rounded-full shadow-lg">
                    {isES ? 'Comprar Colección' : 'Shop Collection'}
                  </Button>
                </Link>
              </div>
            </div>
            
          </div>
        </section>
      )}

      {/* Products Grid Slider */}
      {products.length > 0 && (
        <section className={`max-w-7xl mx-auto w-full px-4 md:px-8 pb-24 ${!desc ? 'pt-24' : ''}`}>
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-dark relative inline-block">
                {isES ? 'Productos Estrella' : 'Star Products'}
                <span className="absolute -bottom-2 left-0 w-1/2 h-1.5 bg-primary rounded-full"></span>
              </h2>
              <p className="text-dark-muted mt-4">
                {isES ? `Los favoritos de nuestra comunidad en ${title.toLowerCase()}.` : `Community favorites in our ${title.toLowerCase()} section.`}
              </p>
            </div>
            <Link href={`/${locale}/tienda?category=${wpCategory.id}`} className="text-primary font-bold hover:underline shrink-0 flex items-center gap-1">
              {isES ? 'Ver todos los productos' : 'View all products'} &rarr;
            </Link>
          </div>
          
          <div className="overflow-hidden p-4 -mx-4">
            <ProductSlider 
              products={products} 
              hideTitle={true} 
              dict={{ 
                prev: isES ? 'Anterior' : 'Previous', 
                next: isES ? 'Siguiente' : 'Next' 
              }} 
            />
          </div>
        </section>
      )}

    </div>
  );
}
