"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/store/cartStore';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  locale?: string;
  dict?: {
    add_to_cart?: string;
    out_of_stock?: string;
    sale?: string;
    featured?: string;
  };
}

// Mapa de colores para renderizar los círculos de variación visual
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

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return '$' + price;
  return '$' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

const ProductCard = ({ product, priority = false, locale = 'en', dict }: ProductCardProps) => {
  const { addItem, toggleCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: parseFloat(product.price || '0'),
      quantity: 1,
      image: product.images?.[0]?.src || '',
    });
    
    toggleCart(true);
  };

  const hasDiscount = product.sale_price && product.sale_price !== product.regular_price;

  // 📅 Cálculo dinámico: New Arrival (creado hace menos de 30 días)
  const isNew = (() => {
    if (!product.date_created) return false;
    const createdDate = new Date(product.date_created);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  })();

  // 🎨 Detección de variación de Color disponible
  const colorAttribute = product.attributes?.find(
    (attr) => attr.name.toLowerCase() === 'color' || attr.name.toLowerCase() === 'colour'
  );

  // Traducciones fallback basadas en idioma
  const isEs = locale === 'es';
  const labelSale = dict?.sale || (isEs ? 'OFERTA' : 'SALE');
  const labelFeatured = dict?.featured || (isEs ? 'DESTACADO' : 'FEATURED');
  const labelOutOfStock = dict?.out_of_stock || (isEs ? 'SIN STOCK' : 'OUT OF STOCK');
  const labelAddToCart = dict?.add_to_cart || (isEs ? 'Añadir' : 'Add to Cart');
  const labelNew = isEs ? 'NOVEDAD' : 'NEW ARRIVAL';

  return (
    <article className="group bg-white p-3.5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-stroke-grey/50 flex flex-col h-full relative font-sans overflow-hidden">
      <Link href={`/${locale}/producto/${product.slug}`} className="absolute inset-0 z-10" aria-label={`Ver detalles de ${product.name}`} />

      {/* Badges Superior Izquierda (New Arrival / Sale) */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 pointer-events-none">
        {isNew && (
          <div className="bg-powder-pink text-soft-charcoal text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {labelNew}
          </div>
        )}
        {hasDiscount && (
          <div className="bg-secondary text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {labelSale}
          </div>
        )}
      </div>

      {/* Badges Superior Derecha (Stock / Featured) */}
      <div className="absolute top-3.5 right-3.5 z-20 flex flex-col items-end gap-1.5 pointer-events-none">
        {product.stock_status === 'outofstock' ? (
          <div className="bg-soft-charcoal/90 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-sm">
            {labelOutOfStock}
          </div>
        ) : product.featured ? (
          <div className="bg-champagne-gold text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {labelFeatured}
          </div>
        ) : null}
      </div>

      {/* Contenedor de Imagen */}
      <div className="overflow-hidden rounded-xl mb-4 relative bg-surface-container-low pointer-events-none z-0 aspect-[4/5]">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt || product.name}
            fill
            className="object-contain p-6 mix-blend-multiply transform group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[48px]">image</span>
          </div>
        )}
      </div>

      {/* Contenedor de Información */}
      <div className="flex flex-col flex-1 px-1.5">
        {/* Categoría Principal */}
        {product.categories?.[0] && (
          <span className="text-[10px] font-bold text-champagne-gold tracking-[0.15em] uppercase mb-1.5">
            {product.categories[0].name}
          </span>
        )}

        {/* Título del Producto */}
        <h3 className="text-[15px] font-serif font-medium text-soft-charcoal mb-1.5 line-clamp-2 leading-snug group-hover:text-champagne-gold transition-colors pointer-events-none z-0 min-h-[40px]">
          {product.name}
        </h3>

        {/* Valoración por Estrellas */}
        {product.rating_count !== undefined && product.rating_count > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5 pointer-events-none">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-[12px] ${
                    star <= Math.round(parseFloat(product.average_rating || '0'))
                      ? 'text-champagne-gold'
                      : 'text-stroke-grey'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-[10px] text-outline font-semibold">
              ({product.rating_count})
            </span>
          </div>
        )}

        {/* Muestra Visual de Colores (Variaciones) */}
        {colorAttribute && (
          <div className="flex items-center gap-1.5 mt-2.5 pointer-events-none">
            {colorAttribute.options.slice(0, 4).map((color) => (
              <div
                key={color}
                className="w-3 h-3 rounded-full border border-stroke-grey shadow-sm"
                style={{ 
                  backgroundColor: COLOR_MAP[color.toLowerCase()] || '#ccc' 
                }}
                title={color}
              />
            ))}
            {colorAttribute.options.length > 4 && (
              <span className="text-[10px] font-bold text-outline tracking-wider">
                +{colorAttribute.options.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Fila Final: Precio y Botón de Añadir */}
        <div className="mt-auto pointer-events-none z-0 flex flex-col gap-4 pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2.5">
              <span className="text-lg font-bold text-soft-charcoal">
                {formatPrice(product.price || '0')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-outline line-through font-medium">
                  {formatPrice(product.regular_price || '0')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock_status === 'outofstock'}
            className="relative z-20 w-full bg-white text-soft-charcoal border border-stroke-grey py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-soft-charcoal hover:text-white hover:border-soft-charcoal transition-all duration-300 pointer-events-auto flex items-center justify-center gap-2 disabled:border-stroke-grey/30 disabled:text-stroke-grey disabled:hover:bg-transparent shadow-sm hover:shadow-md"
          >
            {product.stock_status === 'outofstock' ? labelOutOfStock : (
              <>
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                {labelAddToCart}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

