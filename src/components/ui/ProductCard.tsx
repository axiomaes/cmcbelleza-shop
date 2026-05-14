"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/store/cartStore';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return '$' + price;
  return '$' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

const ProductCard = ({ product, priority = false }: ProductCardProps) => {
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

  return (
    <article className="group bg-white p-3 rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 border border-outline-variant/20 flex flex-col h-full relative font-sans">
      <Link href={`/producto/${product.slug}`} className="absolute inset-0 z-10" aria-label={`Ver detalles de ${product.name}`} />

      {/* Badges */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-2 pointer-events-none">
        {hasDiscount && (
          <div className="bg-secondary text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-widest shadow-md">
            OFERTA
          </div>
        )}
        {product.featured && (
          <div className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-widest shadow-md">
            DESTACADO
          </div>
        )}
      </div>

      {/* Stock status */}
      {product.stock_status === 'outofstock' && (
        <div className="absolute top-5 right-5 z-20 bg-surface-container-highest/80 text-on-surface text-[10px] font-bold px-2.5 py-1 rounded backdrop-blur-md pointer-events-none">
          SIN STOCK
        </div>
      )}

      {/* Visual Image container: Using object-cover to look like professional editorial shop, or contain if they are isolated. Let's stick to cover if ratio is fixed. Actually, object-contain on white BG is safer for most e-commerce packs. Let's upgrade padding */}
      <div className="overflow-hidden rounded-lg mb-4 relative bg-surface-container-low pointer-events-none z-0 aspect-[4/5]">
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
        
        {/* Bottom Hover Overlay functionality for quick actions */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/20 to-transparent hidden md:block">
           {/* Could put quick-add here, but simple is better */}
        </div>
      </div>

      <div className="flex flex-col flex-1 px-1">
        <h3 className="text-base font-serif font-medium text-on-surface mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors pointer-events-none z-0 min-h-[40px]">
          {product.name}
        </h3>

        <div className="mt-auto pointer-events-none z-0 flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-2 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">
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
            className="relative z-20 w-full bg-white text-primary border border-primary py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300 pointer-events-auto flex items-center justify-center gap-2 disabled:border-outline-variant disabled:text-outline-variant disabled:hover:bg-transparent"
          >
            {product.stock_status === 'outofstock' ? 'Agotado' : (
              <>
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                Añadir
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
