'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';

export default function FeaturedCarousel({ products }: { products: Product[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) === products.length ? 0 : prev + 1);
  };
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1) < 0 ? products.length - 1 : prev - 1);
  };

  useEffect(() => {
    if (products.length <= 1) return;
    if (isHovered) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }
    timeoutRef.current = setTimeout(nextSlide, 3000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isHovered, products.length]);

  if (!products || products.length === 0) return null;

  return (
    <div 
      className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden group shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {products.map((product, index) => {
        const imageSrc = (product.images && product.images.length > 0) ? product.images[0].src : '/placeholder.jpg';
        return (
          <div 
            key={product.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1280px"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
              <div className="text-white max-w-xl">
                <h3 className="text-2xl md:text-3xl font-bold mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-xl md:text-2xl font-semibold text-primary/90">{Number(product.price).toFixed(2)} €</p>
              </div>
              <Link 
                href={`/producto/${product.slug}`} 
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-full transition-colors whitespace-nowrap"
              >
                Ver Producto
              </Link>
            </div>
          </div>
        )
      })}

      {products.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100">
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
