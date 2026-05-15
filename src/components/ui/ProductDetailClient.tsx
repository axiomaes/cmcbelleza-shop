'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { Star, Heart, ChevronDown, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import AddToCartButton from './AddToCartButton';

interface ProductDetailClientProps {
  product: Product;
  dict: any;
  locale: string;
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

function decodeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return '$' + price;
  return '$' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export default function ProductDetailClient({ product, dict, locale }: ProductDetailClientProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%', backgroundImage: '' });

  const images = product.images && product.images.length > 0 ? product.images : [{ src: '/placeholder-img.jpg', alt: 'Placeholder' }];
  const categoryName = product.categories?.[0]?.name ? decodeHtml(product.categories[0].name) : '';
  
  const rating = parseFloat(product.average_rating || '0');
  const ratingCount = product.rating_count || 0;

  // Extracción de Color Attributes
  const colorAttribute = product.attributes?.find(
    (attr) => attr.name.toLowerCase() === 'color' || attr.name.toLowerCase() === 'colour'
  );

  // Manejo de Zoom al pasar el mouse por la imagen grande
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - window.scrollX - left) / width) * 100;
    const y = ((e.pageY - window.scrollY - top) / height) * 100;
    
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${images[activeImageIndex].src})`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ ...zoomStyle, display: 'none' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans py-6">
      
      {/* 🍞 Breadcrumbs */}
      <nav className="text-[10px] font-bold tracking-widest uppercase text-[#888888] mb-8 flex items-center gap-2">
        <Link href={`/${locale}`} className="hover:text-[#333333] transition-colors">HOME</Link>
        <span>/</span>
        {product.categories?.[0] && (
          <>
            <Link href={`/${locale}/tienda`} className="hover:text-[#333333] transition-colors">
              {categoryName}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#333333] truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* 🌟 SECCIÓN 1 — Galería + Info (Grid 7/5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        
        {/* 🖼️ Galería (col-span-7) */}
        <div className="col-span-1 lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 h-fit">
          {/* Thumbnails verticales a la izquierda */}
          <div className="flex md:flex-col gap-3 w-full md:w-20 flex-shrink-0 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={img.src + idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-white rounded-lg border-2 transition-all overflow-hidden aspect-square focus:outline-none ${
                  activeImageIndex === idx ? 'border-[#D4AF37] shadow-sm scale-105' : 'border-[#E5E5E5] hover:border-[#D4AF37]/50'
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt || product.name}
                  fill
                  className="object-contain p-1 mix-blend-multiply"
                  sizes="80px"
                />
              </button>
            ))}
          </div>

          {/* Imagen principal grande con Zoom Effect */}
          <div 
            className="relative flex-1 aspect-square bg-white rounded-2xl overflow-hidden border border-[#E5E5E5]/40 cursor-crosshair group flex items-center justify-center p-4 md:p-8"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Image
              src={images[activeImageIndex].src}
              alt={images[activeImageIndex].alt || product.name}
              fill
              className="object-contain mix-blend-multiply p-6 transition-transform duration-300 group-hover:opacity-0"
              priority
              sizes="(max-width: 768px) 100vw, 600px"
            />
            
            {/* Div de Zoom dinámico */}
            <div
              className="absolute inset-0 bg-no-repeat pointer-events-none transition-opacity duration-200 hidden group-hover:block bg-white z-10"
              style={{
                backgroundImage: zoomStyle.backgroundImage,
                backgroundPosition: zoomStyle.backgroundPosition,
                backgroundSize: '200%',
              }}
            />
          </div>
        </div>

        {/* 📋 Info producto (col-span-5) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col">
          
          {/* Badge Categoría */}
          {categoryName && (
            <span className="bg-[#F4E1D2] text-[#333333] px-3.5 py-1.5 rounded-full font-sans font-bold text-[10px] tracking-widest w-fit mb-5 shadow-sm uppercase">
              {categoryName}
            </span>
          )}

          {/* Título */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.5rem] leading-tight font-medium text-[#333333] uppercase tracking-wide mb-3">
            {product.name}
          </h1>

          {/* Valoraciones / Estrellas */}
          <div className="flex items-center gap-1 mb-5">
            <div className="flex text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  fill={i < Math.round(rating) ? "#D4AF37" : "transparent"} 
                  className={i < Math.round(rating) ? "text-[#D4AF37]" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-xs text-[#888888] font-bold ml-1">
              ({ratingCount} {locale === 'es' ? 'reseñas' : 'reviews'})
            </span>
          </div>

          {/* Precio */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl md:text-[1.75rem] font-serif font-medium text-[#D4AF37]">
              {formatPrice(product.price || '0')}
            </span>
            {product.sale_price && product.sale_price !== product.regular_price && (
              <span className="text-lg text-[#888888] line-through">
                {formatPrice(product.regular_price || '0')}
              </span>
            )}
          </div>

          {/* Breve descripción / Sanitizado */}
          {product.short_description && (
            <div 
              className="prose prose-sm max-w-none text-[#555555] leading-relaxed mb-8 font-sans text-[14px]"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}

          {/* Swatches de colores si existen */}
          {colorAttribute && (
            <div className="mb-8 border-t border-[#E5E5E5]/60 pt-6">
              <span className="text-[11px] font-bold text-[#333333] uppercase tracking-widest block mb-3.5">
                {locale === 'es' ? 'COLOR DISPONIBLE' : 'SELECT COLOR'}: {selectedColor ? selectedColor.toUpperCase() : ''}
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                {colorAttribute.options.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center relative group transition-all shadow-sm focus:outline-none ${
                      selectedColor === color ? 'border-[#D4AF37] scale-110 shadow-md' : 'border-white ring-1 ring-[#E5E5E5] hover:border-[#D4AF37]/60'
                    }`}
                    title={color}
                  >
                    <span 
                      className="block w-full h-full rounded-full border border-white"
                      style={{ backgroundColor: COLOR_MAP[color.toLowerCase()] || '#cccccc' }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fila de Botones de Compra */}
          <div className="flex flex-col gap-4 mt-2 border-t border-[#E5E5E5]/60 pt-6">
            <div className="flex gap-3 items-stretch">
              <div className="flex-1">
                <AddToCartButton product={product} dict={dict.store} />
              </div>
              
              <button className="w-14 h-14 rounded-xl border border-[#E5E5E5] flex items-center justify-center hover:bg-gray-50 text-[#333333] hover:text-[#D4AF37] hover:border-[#D4AF37]/60 transition-all shrink-0 shadow-sm group">
                <Heart size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Botón COMPRAR AHORA */}
            {product.stock_status !== 'outofstock' && (
              <button className="w-full h-14 bg-[#333333] text-white rounded-xl font-sans font-bold uppercase tracking-widest text-xs shadow-md hover:bg-[#D4AF37] transition-all duration-300 active:scale-[0.99]">
                {locale === 'es' ? 'COMPRAR AHORA' : 'BUY IT NOW'}
              </button>
            )}
          </div>

          {/* Badges de Confianza */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-t border-b border-[#E5E5E5]/60 mt-8 text-[11px] font-bold tracking-wider text-[#555555] uppercase">
            <div className="flex items-center gap-2.5 justify-center md:justify-start">
              <Truck size={16} className="text-[#D4AF37]" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2.5 justify-center">
              <ShieldCheck size={16} className="text-[#D4AF37]" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2.5 justify-center md:justify-end">
              <RefreshCw size={16} className="text-[#D4AF37]" />
              <span>Easy Returns</span>
            </div>
          </div>

        </div>
      </div>

      {/* 🔄 SECCIÓN 2 — Specs Colapsables */}
      <div className="border-t border-[#E5E5E5] mb-16 max-w-4xl">
        
        {/* Acordeón 1: Specs / Details */}
        <details className="group border-b border-[#E5E5E5] cursor-pointer" open>
          <summary className="flex items-center justify-between py-5 font-serif text-lg md:text-xl font-medium text-[#333333] list-none uppercase tracking-wide hover:text-[#D4AF37] transition-colors focus:outline-none">
            <span>{locale === 'es' ? 'Detalles del Producto' : 'Product Details'}</span>
            <ChevronDown size={20} className="text-[#333333] group-open:rotate-180 transition-transform duration-300 ease-in-out" />
          </summary>
          <div className="py-5 text-[14px] text-[#555555] leading-relaxed font-sans cursor-default">
            {product.description ? (
              <div 
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="italic">{locale === 'es' ? 'No hay descripción adicional.' : 'No additional description available.'}</p>
            )}

            {/* Tabla de atributos adicionales si existen */}
            {product.attributes && product.attributes.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-2.5 max-w-lg border-t border-[#E5E5E5]/60 pt-5">
                {product.attributes.map(attr => (
                  <div key={attr.name} className="flex justify-between items-center py-1.5 border-b border-[#E5E5E5]/30 text-[12px]">
                    <span className="font-bold text-[#333333] uppercase tracking-wider">{attr.name}</span>
                    <span className="text-[#777777] text-right">{attr.options.join(', ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>

        {/* Acordeón 2: How to Use */}
        <details className="group border-b border-[#E5E5E5] cursor-pointer">
          <summary className="flex items-center justify-between py-5 font-serif text-lg md:text-xl font-medium text-[#333333] list-none uppercase tracking-wide hover:text-[#D4AF37] transition-colors focus:outline-none">
            <span>{locale === 'es' ? 'Modo de Empleo' : 'How to Use'}</span>
            <ChevronDown size={20} className="text-[#333333] group-open:rotate-180 transition-transform duration-300 ease-in-out" />
          </summary>
          <div className="py-5 text-[14px] text-[#555555] leading-relaxed font-sans cursor-default">
             <p className="mb-3">Apply daily as part of your specialized beauty care ritual. Gently massage into the desired area until fully integrated.</p>
             <p className="italic opacity-80">Caution: For external use only. Avoid direct contact with eyes.</p>
          </div>
        </details>

        {/* Acordeón 3: Shipping & Returns */}
        <details className="group border-b border-[#E5E5E5] cursor-pointer">
          <summary className="flex items-center justify-between py-5 font-serif text-lg md:text-xl font-medium text-[#333333] list-none uppercase tracking-wide hover:text-[#D4AF37] transition-colors focus:outline-none">
            <span>{locale === 'es' ? 'Envíos y Devoluciones' : 'Shipping & Returns'}</span>
            <ChevronDown size={20} className="text-[#333333] group-open:rotate-180 transition-transform duration-300 ease-in-out" />
          </summary>
          <div className="py-5 text-[14px] text-[#555555] leading-relaxed font-sans cursor-default">
            <p className="mb-4">📦 <strong>Standard Delivery:</strong> Enjoy free shipping on all US orders over $50. Products are typically processed within 1-2 business days and delivered via our logistics network in 3 to 5 days.</p>
            <p>🔄 <strong>Hassle-free Returns:</strong> If you are not 100% satisfied with your purchase, you can return the product for up to 30 days from the date you purchased it. Terms apply.</p>
          </div>
        </details>

      </div>
    </div>
  );
}
