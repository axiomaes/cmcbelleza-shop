import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchProductBySlug, fetchProducts, fetchProductReviews } from '@/lib/woocommerce';
import ProductDetailClient from '@/components/ui/ProductDetailClient';
import ProductCard from '@/components/ui/ProductCard';
import { getDictionary } from '@/lib/get-dictionary';
import { Star, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export const revalidate = 3600; // 1 hour

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
      title: `${product.name} | CMC Belleza`,
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

  // Fetch Related Products (Same category, exclude current)
  let relatedProducts: any[] = [];
  if (product.categories && product.categories.length > 0) {
    try {
      const categoryId = product.categories[0].id;
      const categoryProducts = await fetchProducts({ 
        category: categoryId.toString(), 
        per_page: 4, 
        lang: locale 
      });
      // Filtrar el producto actual
      relatedProducts = categoryProducts.filter(p => p.id !== product.id).slice(0, 3);
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  }

  // Fetch Product Reviews
  let reviews: any[] = [];
  try {
    reviews = await fetchProductReviews(product.id);
  } catch (error) {
    console.error("Error fetching product reviews:", error);
  }

  const averageRating = parseFloat(product.average_rating || '0');

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">
      
      {/* 💎 Sección 1 & 2: Galería, Info y Specs Collapsables */}
      <ProductDetailClient product={product} dict={dict} locale={locale} />

      {/* 🛍️ SECCIÓN 3 — Complete the Look */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E5E5E5]/60">
          <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-widest text-[#333333] text-center mb-12 font-medium">
            {locale === 'es' ? 'Completa el Look' : 'Complete the Look'}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {relatedProducts.map((relProduct) => (
              <ProductCard 
                key={relProduct.id} 
                product={relProduct} 
                locale={locale}
                dict={dict.store} 
              />
            ))}
          </div>
        </section>
      )}

      {/* ⭐ SECCIÓN 4 — Customer Reviews */}
      {reviews.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E5E5E5]/60">
          
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-12">
            <div>
              <h2 className="font-serif text-2xl uppercase tracking-widest text-[#333333] mb-4 font-medium">
                {locale === 'es' ? 'Opiniones de Clientes' : 'Customer Reviews'}
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      fill={i < Math.round(averageRating) ? "#D4AF37" : "transparent"} 
                      className={i < Math.round(averageRating) ? "text-[#D4AF37]" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-[#333333]">
                  {averageRating.toFixed(1)} {locale === 'es' ? 'de 5 estrellas' : 'out of 5 stars'}
                </span>
              </div>
              <p className="text-xs text-[#888888] mt-2">
                {locale === 'es' ? `Basado en ${reviews.length} valoraciones.` : `Based on ${reviews.length} reviews.`}
              </p>
            </div>

            <button className="bg-[#333333] text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md hover:bg-[#D4AF37] transition-colors">
              {locale === 'es' ? 'Escribir una Opinión' : 'Write a Review'}
            </button>
          </div>

          {/* Review List */}
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-6 md:p-8 rounded-2xl border border-[#E5E5E5]/40 shadow-sm font-sans">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex text-[#D4AF37] mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i < rev.rating ? "#D4AF37" : "transparent"} 
                          className={i < rev.rating ? "text-[#D4AF37]" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-sm text-[#333333]">{rev.reviewer}</span>
                    {rev.verified && (
                      <span className="ml-2 bg-[#F4E1D2] text-[#333333] px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase">
                        {locale === 'es' ? 'Verificado' : 'Verified'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#888888]">
                    {new Date(rev.date_created).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div 
                  className="text-[14px] leading-relaxed text-[#555555]"
                  dangerouslySetInnerHTML={{ __html: rev.review }}
                />
              </div>
            ))}
          </div>

        </section>
      )}

    </div>
  );
}