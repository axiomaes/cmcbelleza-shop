import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProductBySlug, fetchProducts } from '@/lib/woocommerce';
import AddToCartButton from '@/components/ui/AddToCartButton';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

// En Next.js 15, params es una Promise
interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // 1 hour

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return price + ' €';
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + ' €';
}

export async function generateStaticParams() {
  try {
    const products = await fetchProducts({ per_page: 20 });
    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await fetchProductBySlug(slug);
    
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
  const { slug } = await params;
  
  let product;
  try {
    product = await fetchProductBySlug(slug);
  } catch (error) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link 
        href="/tienda" 
        className="inline-flex items-center text-dark-muted hover:text-primary mb-8 font-medium transition-colors group"
      >
        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Volver a la tienda
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white/60 backdrop-blur-sm p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-white/60">
        
        <div className="rounded-3xl overflow-hidden bg-white p-8 shadow-inner relative aspect-square flex items-center justify-center border border-gray-50">
          {product.images && product.images.length > 0 ? (
            <Image 
              src={product.images[0].src} 
              alt={product.images[0].alt || product.name}
              fill
              className="object-contain p-4"
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
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
                {product.categories[0].name}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <p className="text-4xl font-black text-secondary">
              {formatPrice(product.price || '0')}
            </p>
            {product.sale_price && product.sale_price !== product.regular_price && (
              <span className="text-xl text-dark-muted line-through opacity-50 font-bold">
                {formatPrice(product.regular_price || '0')}
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-6 mb-10">
            <div 
              className="prose prose-slate max-w-none text-dark-muted leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: product.description || product.short_description || '' }} 
            />
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-dark-muted font-medium">
                <CheckCircle size={18} className="text-primary" />
                <span>Envío 24/48h garantizado</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-muted font-medium">
                <CheckCircle size={18} className="text-primary" />
                <span>Producto 100% Original</span>
              </div>
            </div>
          </div>
          
          <div className="w-full max-w-md">
            <AddToCartButton product={product} />
          </div>
          
          <p className="mt-6 text-xs text-dark-muted/60 italic">
            * Los precios incluyen IVA. Gastos de envío calculados en el checkout.
          </p>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="text-2xl font-bold text-dark mb-8 border-l-4 border-primary pl-4">Descripción detallada</h2>
        <div className="bg-white/40 backdrop-blur-sm p-8 rounded-3xl border border-white/40 shadow-sm text-dark-muted">
           {!product.description ? (
             <p>No hay descripción adicional disponible para este producto.</p>
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