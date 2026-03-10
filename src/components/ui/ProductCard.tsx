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
  if (isNaN(num)) return price;
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + ' €';
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
    <article className="group bg-white/60 backdrop-blur-sm p-4 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white/60 flex flex-col h-full relative overflow-hidden">
      <Link href={`/producto/${product.slug}`} className="absolute inset-0 z-10" aria-label={`Ver detalles de ${product.name}`} />

      {/* Badge Oferta */}
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-20 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-1 group-hover:rotate-3 transition-transform">
          OFERTA
        </div>
      )}

      {/* Stock Status */}
      {product.stock_status === 'outofstock' && (
        <div className="absolute top-4 right-4 z-20 bg-dark/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">
          Agotado
        </div>
      )}

      <div className="overflow-hidden rounded-xl mb-4 relative bg-white pointer-events-none z-0 aspect-square">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt || product.name}
            fill
            className="object-contain p-4 transform group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <span className="text-sm text-dark-muted font-medium">Sin imagen</span>
          </div>
        )}
        
        {/* Overlay al hover */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500"></div>
      </div>

      <div className="flex flex-col flex-1">
        <h2 className="text-lg font-bold text-dark line-clamp-2 leading-tight group-hover:text-primary transition-colors pointer-events-none z-0 mb-2">
          {product.name}
        </h2>

        <div className="mt-auto pointer-events-none z-0">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-extrabold text-secondary">
              {formatPrice(product.price || '0')}
            </span>
            {hasDiscount && (
              <span className="text-sm text-dark-muted line-through opacity-50">
                {formatPrice(product.regular_price || '0')}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="relative z-20 w-full bg-dark text-white py-3 rounded-full font-bold hover:bg-primary hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform active:scale-95 pointer-events-auto"
            disabled={product.stock_status === 'outofstock'}
          >
            {product.stock_status === 'outofstock' ? 'Sin stock' : 'Añadir al carrito'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
