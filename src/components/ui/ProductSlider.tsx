"use client";

import React, { useRef } from 'react';
import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ProductSliderProps {
  products: Product[];
}

const ProductSlider = ({ products }: ProductSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group min-h-[320px]">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold text-dark relative inline-block">
          Destacados del momento
          <span className="absolute -bottom-2 left-0 w-1/2 h-1.5 bg-primary rounded-full"></span>
        </h2>

        <div className="flex space-x-2">
          <button 
            onClick={() => scroll('left')}
            className="p-3 rounded-full bg-white border border-gray-100 text-dark hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm hover:shadow-md active:scale-95" 
            aria-label="Anterior"
          >
            <ArrowLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-3 rounded-full bg-white border border-gray-100 text-dark hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm hover:shadow-md active:scale-95" 
            aria-label="Siguiente"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-12 scroll-smooth hide-scrollbar transition-all"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="snap-start flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px]">
            <ProductCard product={product} />
          </div>
        ))}
        
        {/* Decorative Spacer */}
        <div className="shrink-0 w-4 lg:w-12"></div>
      </div>
      
      {/* Decorative Gradients for visual cue of more items */}
      <div className="absolute top-20 left-0 w-12 h-full bg-gradient-to-r from-base to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute top-20 right-0 w-12 h-full bg-gradient-to-l from-base to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

export default ProductSlider;
