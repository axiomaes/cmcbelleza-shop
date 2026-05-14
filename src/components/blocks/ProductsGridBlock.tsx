import React from 'react';
import { ProductsGridBlockData } from '@/lib/cms';
import { fetchProducts } from '@/lib/woocommerce';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/types';

export default async function ProductsGridBlock({ 
  data, 
  locale = 'es' 
}: { 
  data: ProductsGridBlockData; 
  locale?: string;
}) {
  // Elementos vacíos preventivos
  if (!data.title) return null;

  let products: Product[] = [];
  
  try {
    // Resolver productos de WooCommerce vía API Server-Side
    products = await fetchProducts({
      category: data.category_id ? data.category_id.toString() : undefined,
      per_page: data.products_count || 4,
      lang: locale
    });
  } catch (error) {
    console.error(`[ProductsGridBlock] Falló el fetch de WooCommerce para categoría ${data.category_id}:`, error);
  }

  // No renderizar la sección completa si falló la API y no hay productos
  if (products.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-24 bg-surface-container-low overflow-hidden font-sans">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* Encabezado de Sección */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-secondary font-bold text-xs uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
            Colección Curada
          </span>
          
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-primary leading-tight font-medium mb-4 line-clamp-2">
            {data.title}
          </h2>
          
          {data.subtitle && (
            <p className="text-on-surface-variant text-base leading-relaxed max-w-lg font-normal line-clamp-3">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Rejilla de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 animate-in fade-in duration-1000 delay-200">
          {products.map((product) => (
            <div key={product.id} className="h-full flex">
              {/* Tarjeta de Producto nativa del diseño original */}
              <ProductCard product={product} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
