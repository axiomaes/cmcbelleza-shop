import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProductBySlug, fetchProducts } from '@/lib/woocommerce';
import AddToCartButton from '@/components/ui/AddToCartButton';
import TextureSlider from '@/components/ui/TextureSlider';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { getDictionary } from '@/lib/get-dictionary';

export const dynamic = 'force-dynamic';

// En Next.js 15, params es una Promise
interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export const revalidate = 3600; // 1 hour

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return '$' + price;
  return '$' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function decodeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

const COLOR_MAP: Record<string, string> = {
  'black': '#1a1a1a',
  'white': '#ffffff',
  'khaki': '#c3b091',
  'brown': '#8B4513',
  'beige': '#f5f0e8',
  'navy': '#001f5b',
  'red': '#dc2626',
  'pink': '#f472b6',
  'gold': '#D4AF37',
  'silver': '#C0C0C0',
  'grey': '#9ca3af',
  'gray': '#9ca3af',
  'green': '#16a34a',
  'blue': '#2563eb',
  'purple': '#7c3aed',
};

export async function generateStaticParams() {
  try {
    const [productsES, productsEN] = await Promise.all([
      fetchProducts({ per_page: 20, lang: 'es' }),
      fetchProducts({ per_page: 20, lang: 'en' }),
    ]);
    
    const paramsES = productsES.map((product) => ({
      locale: 'es',
      slug: product.slug,
    }));
    
    const paramsEN = productsEN.map((product) => ({
      locale: 'en',
      slug: product.slug,
    }));
    
    return [...paramsES, ...paramsEN];
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  try {
    const product = await fetchProductBySlug(slug, locale);
    
    return {
      title: product.name,
      description: product.short_description?.replace(/<[^>]*>?/gm, '') || `Comprar ${product.name} en CMC Belleza. Calidad profesional garantizada.`,
      openGraph: {
        title: product.name,
        images: product.images?.[0]?.src ? [product.images[0].src] : [],
      },
    };
  } catch (e) {
    return {
      title: 'Producto no encontrado',
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug, locale } = await params;
  const dict = await getDictionary(locale as any);
  
  let product;
  try {
    product = await fetchProductBySlug(slug, locale);
  } catch (error) {
    notFound();
  }

  const hasDiscount = product.sale_price && product.sale_price !== product.regular_price;

  // 📅 New Arrival logic
  const isNew = (() => {
    if (!product.date_created) return false;
    const createdDate = new Date(product.date_created);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  })();

  // 🎨 Color variations
  const colorAttribute = product.attributes?.find(
    (attr: any) => attr.name.toLowerCase() === 'color' || attr.name.toLowerCase() === 'colour'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <Link 
        href={`/${locale}/tienda`} 
        className="inline-flex items-center text-dark-muted hover:text-primary mb-8 font-bold text-xs uppercase tracking-widest transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        {dict.store.back_to_shop}
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white/60 backdrop-blur-sm p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-white/60">
        
        <div className="rounded-3xl overflow-hidden bg-white p-8 shadow-inner relative aspect-square flex items-center justify-center border border-stroke-grey/20">
          
          {/* Floating premium badges */}
          <div className="absolute top-5 left-5 z-20 flex flex-col gap-2 pointer-events-none">
            {isNew && (
              <div className="bg-powder-pink text-soft-charcoal text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {locale === 'es' ? 'NOVEDAD' : 'NEW ARRIVAL'}
              </div>
            )}
            {hasDiscount && (
              <div className="bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {locale === 'es' ? 'OFERTA' : 'SALE'}
              </div>
            )}
          </div>

          <div className="absolute top-5 right-5 z-20 flex flex-col items-end gap-2 pointer-events-none">
            {product.stock_status === 'outofstock' ? (
              <div className="bg-soft-charcoal/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-sm">
                {dict.store.out_of_stock_btn}
              </div>
            ) : product.featured ? (
              <div className="bg-champagne-gold text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {locale === 'es' ? 'DESTACADO' : 'FEATURED'}
              </div>
            ) : null}
          </div>

          {product.images && product.images.length > 0 ? (
            <Image 
              src={product.images[0].src} 
              alt={product.images[0].alt || product.name}
              fill
              className="object-contain p-4 mix-blend-multiply"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-xl">
              <span className="text-dark-muted">Sin imagen disponible</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col justify-center">
          <div className="mb-6">
            {product.categories && product.categories.length > 0 && (
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-champagne-gold mb-3 block">
                {decodeHtml(product.categories[0].name)}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-soft-charcoal leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <p className="text-3xl font-bold text-soft-charcoal">
              {formatPrice(product.price || '0')}
            </p>
            {hasDiscount && (
              <span className="text-xl text-outline line-through font-medium">
                {formatPrice(product.regular_price || '0')}
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-6 mb-10">
            <div 
              className="prose prose-slate max-w-none text-on-surface-variant/90 leading-relaxed text-[15px]" 
              dangerouslySetInnerHTML={{ __html: product.short_description || product.description || '' }} 
            />

            {/* Color Swatches Section */}
            {colorAttribute && (
              <div className="mt-2">
                <span className="text-xs font-bold text-soft-charcoal uppercase tracking-wider block mb-3">
                  {locale === 'es' ? 'Colores Disponibles' : 'Available Colors'}
                </span>
                <div className="flex items-center gap-2.5">
                  {colorAttribute.options.map((color: string) => (
                    <div
                      key={color}
                      className="w-6 h-6 rounded-full border border-white ring-2 ring-stroke-grey shadow-sm transition-transform duration-200 hover:scale-110"
                      style={{ 
                        backgroundColor: COLOR_MAP[color.toLowerCase()] || '#ccc' 
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-3 pt-2 border-t border-stroke-grey/40 mt-2">
              <div className="flex items-center gap-2.5 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                <CheckCircle size={16} className="text-champagne-gold" />
                <span>{locale === 'es' ? 'Envío estándar a todo USA' : 'Standard US Shipping'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                <CheckCircle size={16} className="text-champagne-gold" />
                <span>{dict.store.authentic_product}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full max-w-md">
            <AddToCartButton product={product} dict={dict.store} />
          </div>
          
          <p className="mt-6 text-xs text-outline/80 italic">
            * {locale === 'es' ? 'Impuestos y gastos de envío calculados en el checkout.' : 'Taxes and shipping calculated at checkout.'}
          </p>

          {/* Texture Slider Interactive Module */}
          {product.images?.[0] && (
            <TextureSlider 
              mainImage={product.images[0].src} 
              textureImage={product.images[1]?.src || "https://images.unsplash.com/photo-1629323145455-d4fc3f5ee923?w=800&q=80"} 
            />
          )}
        </div>
      </div>

      <section className="mt-20">
        <h2 className="text-xl font-serif font-medium text-soft-charcoal mb-8 border-l-4 border-champagne-gold pl-4">
          {dict.store.details}
        </h2>
        <div className="bg-white/40 backdrop-blur-sm p-8 rounded-3xl border border-stroke-grey/30 shadow-sm text-on-surface-variant leading-relaxed">
           {!product.description ? (
             <p className="italic">{locale === 'es' ? 'No hay descripción adicional disponible.' : 'No additional description available.'}</p>
           ) : (
             <div 
               className="prose prose-lg max-w-none"
               dangerouslySetInnerHTML={{ __html: product.description }}
             />
           )}
        </div>
      </section>
    </div>
  );
}